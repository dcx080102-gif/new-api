package controller

import (
	"net/http"
	"sort"
	"time"

	"github.com/QuantumNous/new-api/model"

	"github.com/gin-gonic/gin"
)

// UptimeHistoryMonitor 公开给 /status 页面的单个监控项数据。
type UptimeHistoryMonitor struct {
	Name         string     `json:"name"`
	Status       int        `json:"status"`         // 1=正常 0=故障 -1=暂无数据
	Uptime24h    float64    `json:"uptime"`         // 24h 可用率（%），-1 表示数据不足
	Uptime7d     float64    `json:"uptime_7d"`      // 7 日可用率（%），-1 表示数据不足
	Samples7d    int64      `json:"samples"`        // 7 日探测样本数
	AvgLatencyMs float64    `json:"avg_latency_ms"` // 7 日平均延迟（毫秒）
	LastCheck    *time.Time `json:"last_check"`     // 最后检测时间（UTC）
}

// UptimeHistoryGroup 公开分组（模型可用性 / 网站可用性）。
type UptimeHistoryGroup struct {
	CategoryName string                 `json:"categoryName"`
	Monitors     []UptimeHistoryMonitor `json:"monitors"`
}

func uptimePercent(ups, samples int64) float64 {
	if samples == 0 {
		return -1
	}
	return float64(ups) * 100.0 / float64(samples)
}

// GetUptimeHistory 返回自算的可用性数据（24h/7d 可用率、样本数、延迟、最后检测时间）。
// 数据来自 status_probe_records 表（由 Uptime 收集器从 Uptime Kuma 心跳累积）。
func GetUptimeHistory(c *gin.Context) {
	now := time.Now()
	since7d := now.Add(-7 * 24 * time.Hour)
	since24h := now.Add(-24 * time.Hour)

	agg7, err7 := model.GetStatusProbeAggregates(since7d)
	agg24, err24 := model.GetStatusProbeAggregates(since24h)
	lastBeats, errLast := model.GetStatusProbeLastBeats(since7d)
	if err7 != nil || err24 != nil || errLast != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "读取可用性数据失败",
			"data":    gin.H{"groups": []UptimeHistoryGroup{}},
		})
		return
	}

	agg24Map := make(map[string]model.StatusProbeAggregate, len(agg24))
	for _, a := range agg24 {
		agg24Map[a.MonitorName] = a
	}
	lastMap := make(map[string]model.StatusProbeLastBeat, len(lastBeats))
	for _, b := range lastBeats {
		lastMap[b.MonitorName] = b
	}

	groupMap := make(map[string]*UptimeHistoryGroup)
	for _, a := range agg7 {
		group := groupMap[a.GroupName]
		if group == nil {
			group = &UptimeHistoryGroup{CategoryName: a.GroupName, Monitors: []UptimeHistoryMonitor{}}
			groupMap[a.GroupName] = group
		}
		m := UptimeHistoryMonitor{
			Name:         a.MonitorName,
			Status:       -1,
			Uptime24h:    -1,
			Uptime7d:     uptimePercent(a.Ups, a.Samples),
			Samples7d:    a.Samples,
			AvgLatencyMs: a.AvgLatency,
		}
		lastCheck := a.LastCheck
		m.LastCheck = &lastCheck
		if a24, ok := agg24Map[a.MonitorName]; ok {
			m.Uptime24h = uptimePercent(a24.Ups, a24.Samples)
		}
		if last, ok := lastMap[a.MonitorName]; ok {
			m.Status = last.Status
			lastCheck = last.BeatTime
			m.LastCheck = &lastCheck
		}
		group.Monitors = append(group.Monitors, m)
	}

	groups := make([]UptimeHistoryGroup, 0, len(groupMap))
	for _, g := range groupMap {
		sort.Slice(g.Monitors, func(i, j int) bool {
			return g.Monitors[i].Name < g.Monitors[j].Name
		})
		groups = append(groups, *g)
	}
	// 网站可用性放最后，模型分组在前
	sort.Slice(groups, func(i, j int) bool {
		iSite := groups[i].CategoryName == "网站可用性"
		jSite := groups[j].CategoryName == "网站可用性"
		if iSite != jSite {
			return !iSite
		}
		return groups[i].CategoryName < groups[j].CategoryName
	})

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"generated_at": now,
			"groups":       groups,
		},
	})
}
