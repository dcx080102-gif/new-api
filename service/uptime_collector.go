package service

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/console_setting"
)

// Uptime 收集器：每 5 分钟从 Uptime Kuma 公开状态页接口抓一次原始心跳，
// 写入 status_probe_records 表，用于自算 7 日可用率/样本数/延迟。
// Kuma 的公开接口只提供 24h 可用率（type=24 写死），7 日数据必须自己累积。

const (
	uptimeCollectInterval  = 5 * time.Minute
	uptimeKumaFetchTimeout = 20 * time.Second
	uptimePruneKeepDays    = 8
)

var uptimePruneOnce sync.Once

// StartUptimeCollector 启动后台采集循环（main.go 调用）。
func StartUptimeCollector() {
	go func() {
		CollectUptimeBeats()
		ticker := time.NewTicker(uptimeCollectInterval)
		defer ticker.Stop()
		for range ticker.C {
			CollectUptimeBeats()
		}
	}()
}

// CollectUptimeBeats 抓取一次 Kuma 心跳并落库（幂等，重复采集自动忽略）。
func CollectUptimeBeats() {
	groups := console_setting.GetUptimeKumaGroups()
	if len(groups) == 0 {
		return
	}
	beats := fetchKumaBeats(groups)
	if len(beats) > 0 {
		if err := model.SaveStatusProbeRecords(beats); err != nil {
			logger.LogError(context.Background(), "uptime collector save beats: "+err.Error())
		}
	}
	// 每天清理一次 8 天前的旧记录
	uptimePruneOnce.Do(func() {
		go func() {
			for {
				if err := model.PruneStatusProbeRecords(time.Now().Add(-uptimePruneKeepDays * 24 * time.Hour)); err != nil {
					logger.LogError(context.Background(), "uptime collector prune: "+err.Error())
				}
				time.Sleep(24 * time.Hour)
			}
		}()
	})
}

func fetchKumaBeats(groups []map[string]interface{}) []model.StatusProbeRecord {
	ctx, cancel := context.WithTimeout(context.Background(), uptimeKumaFetchTimeout)
	defer cancel()
	client := &http.Client{Timeout: 15 * time.Second}

	monitorNameByID := map[int]string{}
	groupNameByID := map[int]string{}

	var beats []model.StatusProbeRecord
	for _, g := range groups {
		baseURL, _ := g["url"].(string)
		slug, _ := g["slug"].(string)
		category, _ := g["categoryName"].(string)
		baseURL = strings.TrimSuffix(baseURL, "/")
		if baseURL == "" || slug == "" {
			continue
		}

		// 状态页：监控项名 + 分组名映射
		var statusData struct {
			PublicGroupList []struct {
				Name        string `json:"name"`
				MonitorList []struct {
					ID   int    `json:"id"`
					Name string `json:"name"`
				} `json:"monitorList"`
			} `json:"publicGroupList"`
		}
		if err := kumaGetJSON(ctx, client, baseURL+"/api/status-page/"+slug, &statusData); err == nil {
			for _, pg := range statusData.PublicGroupList {
				for _, m := range pg.MonitorList {
					monitorNameByID[m.ID] = m.Name
					groupNameByID[m.ID] = pg.Name
				}
			}
		}

		// 心跳：最近 50 条原始记录
		var heartbeatData struct {
			HeartbeatList map[string][]struct {
				Status int    `json:"status"`
				Time   string `json:"time"`
				Ping   *int   `json:"ping"`
			} `json:"heartbeatList"`
		}
		if err := kumaGetJSON(ctx, client, baseURL+"/api/status-page/heartbeat/"+slug, &heartbeatData); err != nil {
			continue
		}
		for midStr, list := range heartbeatData.HeartbeatList {
			mid, err := strconv.Atoi(midStr)
			if err != nil {
				continue
			}
			name := monitorNameByID[mid]
			if name == "" {
				continue
			}
			groupName := groupNameByID[mid]
			if groupName == "" {
				groupName = category
			}
			for _, hb := range list {
				if hb.Status == 2 {
					// 2=pending（探测进行中），不是最终结果，跳过
					continue
				}
				beatTime, err := parseKumaTime(hb.Time)
				if err != nil {
					continue
				}
				latency := 0
				if hb.Ping != nil {
					latency = *hb.Ping
				}
				status := 0
				if hb.Status == 1 {
					status = 1
				}
				beats = append(beats, model.StatusProbeRecord{
					MonitorName: name,
					GroupName:   groupName,
					Status:      status,
					LatencyMs:   latency,
					BeatTime:    beatTime,
				})
			}
		}
	}
	return beats
}

func kumaGetJSON(ctx context.Context, client *http.Client, url string, dest interface{}) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("non-200 status: %s", resp.Status)
	}
	return common.DecodeJson(resp.Body, dest)
}

// parseKumaTime 解析 Kuma 心跳时间（UTC，"2006-01-02 15:04:05" 或带毫秒）。
func parseKumaTime(s string) (time.Time, error) {
	s = strings.TrimSpace(s)
	if t, err := time.ParseInLocation("2006-01-02 15:04:05.000", s, time.UTC); err == nil {
		return t, nil
	}
	if t, err := time.ParseInLocation("2006-01-02 15:04:05", s, time.UTC); err == nil {
		return t, nil
	}
	if t, err := time.Parse(time.RFC3339, s); err == nil {
		return t, nil
	}
	return time.Time{}, fmt.Errorf("unrecognized time format: %s", s)
}
