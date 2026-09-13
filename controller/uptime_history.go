package controller

import (
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"

	"github.com/gin-gonic/gin"
)

// 公开 /status 页数据（主动探针 + 真实调用日志双源合并）。
// 探针数据来自 status_probe_records（Kuma 心跳），日志数据来自 logs 表（被动聚合）。

// UptimeHistoryDaily 某天聚合。
type UptimeHistoryDaily struct {
	Day   string `json:"day"`
	Up    int64  `json:"up"`
	Total int64  `json:"total"`
}

// UptimeHistoryMonitor 单个监控项数据。
type UptimeHistoryMonitor struct {
	Name         string                `json:"name"`
	Status       int                   `json:"status"`          // 1=正常 0=故障 -1=暂无数据
	Uptime24h    float64               `json:"uptime"`          // 24h 可用率（%），-1 表示数据不足
	Uptime7d     float64               `json:"uptime_7d"`       // 7 日可用率（%），-1 表示数据不足
	Samples7d    int64                 `json:"samples"`         // 7 日可判定样本总数
	ProbeSamples int64                 `json:"probe_samples"`   // 其中主动探针样本
	LogSamples   int64                 `json:"log_samples"`     // 其中真实调用样本
	AvgLatencyMs float64               `json:"avg_latency_ms"`  // 平均延迟（毫秒，来自探针），-1 无数据
	LastCheck    *time.Time            `json:"last_check"`      // 最后检测/调用时间
	Daily        []UptimeHistoryDaily  `json:"daily"`           // 近 30 天每日 up/total
}

// UptimeHistoryGroup 按厂商分组（GPT/Claude/Gemini/GLM/Kimi/其他 + 网站可用性）。
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

func vendorOf(model string) string {
	m := strings.ToLower(model)
	switch {
	case strings.HasPrefix(m, "gpt-"), strings.HasPrefix(m, "o1-"),
		strings.HasPrefix(m, "o3-"), strings.HasPrefix(m, "o4-"),
		strings.HasPrefix(m, "codex-"):
		return "GPT"
	case strings.HasPrefix(m, "claude-"):
		return "Claude"
	case strings.HasPrefix(m, "gemini-"):
		return "Gemini"
	case strings.HasPrefix(m, "glm-"):
		return "GLM"
	case strings.HasPrefix(m, "kimi-"):
		return "Kimi"
	case strings.HasPrefix(m, "deepseek"):
		return "DeepSeek"
	default:
		return "其他"
	}
}

// 分组展示顺序（网站可用性恒在最后）。
var vendorOrder = []string{"GPT", "Claude", "Gemini", "GLM", "Kimi", "DeepSeek", "其他", "网站可用性"}

func vendorRank(name string) int {
	for i, v := range vendorOrder {
		if v == name {
			return i
		}
	}
	return len(vendorOrder) + 1
}

// passiveSinceEpoch 读取被动聚合的起点（探针 token 改名前的时间戳，之前日志含探针流量不可用）。
func passiveSinceEpoch() int64 {
	common.OptionMapRWMutex.RLock()
	v := common.OptionMap["status_passive_since"]
	common.OptionMapRWMutex.RUnlock()
	n, _ := strconv.ParseInt(strings.TrimSpace(v), 10, 64)
	return n
}

type monitorAcc struct {
	probeUps7d, probeSamples7d       int64
	probeUps24h, probeSamples24h     int64
	probeLatencySum, probeLatencyCnt float64
	probeLast                        time.Time
	logUps7d, logDown7d              int64
	logUps24h, logDown24h            int64
	logLast                          time.Time
	statusProbe                      int
	statusProbeSet                   bool
	daily                            map[string]*UptimeHistoryDaily
	hasProbe                         bool
	hasLog                           bool
}

// GetUptimeHistory 返回双源合并的可用性数据（公开接口）。
func GetUptimeHistory(c *gin.Context) {
	now := time.Now()
	since7d := now.Add(-7 * 24 * time.Hour)
	since24h := now.Add(-24 * time.Hour)
	since30d := now.Add(-30 * 24 * time.Hour)
	passiveSince := passiveSinceEpoch()
	logSince7 := since7d.Unix()
	if passiveSince > logSince7 {
		logSince7 = passiveSince
	}
	logSince24 := since24h.Unix()
	if passiveSince > logSince24 {
		logSince24 = passiveSince
	}
	logSince30 := since30d.Unix()
	if passiveSince > logSince30 {
		logSince30 = passiveSince
	}

	probe7, err := model.GetStatusProbeAggregates(since7d)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "读取可用性数据失败", "data": gin.H{"groups": []UptimeHistoryGroup{}}})
		return
	}
	probe24, err := model.GetStatusProbeAggregates(since24h)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "读取可用性数据失败", "data": gin.H{"groups": []UptimeHistoryGroup{}}})
		return
	}
	probeLast, err := model.GetStatusProbeLastBeats(since7d)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "读取可用性数据失败", "data": gin.H{"groups": []UptimeHistoryGroup{}}})
		return
	}
	probeDaily, err := model.GetStatusProbeDailyAggregates(since30d)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "读取可用性数据失败", "data": gin.H{"groups": []UptimeHistoryGroup{}}})
		return
	}
	log7, err := model.GetLogPassiveAggregates(logSince7)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "读取可用性数据失败", "data": gin.H{"groups": []UptimeHistoryGroup{}}})
		return
	}
	log24, err := model.GetLogPassiveAggregates(logSince24)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "读取可用性数据失败", "data": gin.H{"groups": []UptimeHistoryGroup{}}})
		return
	}
	logDaily, err := model.GetLogPassiveDailyAggregates(logSince30)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "读取可用性数据失败", "data": gin.H{"groups": []UptimeHistoryGroup{}}})
		return
	}

	accs := map[string]*monitorAcc{}
	getAcc := func(name string) *monitorAcc {
		a := accs[name]
		if a == nil {
			a = &monitorAcc{daily: map[string]*UptimeHistoryDaily{}}
			accs[name] = a
		}
		return a
	}

	// 探针聚合
	for _, p := range probe7 {
		a := getAcc(p.MonitorName)
		a.hasProbe = true
		a.probeUps7d += p.Ups
		a.probeSamples7d += p.Samples
		a.probeLatencySum += p.AvgLatency * float64(p.Samples)
		a.probeLatencyCnt += float64(p.Samples)
		if p.LastCheck.After(a.probeLast) {
			a.probeLast = p.LastCheck
		}
	}
	for _, p := range probe24 {
		a := getAcc(p.MonitorName)
		a.hasProbe = true
		a.probeUps24h += p.Ups
		a.probeSamples24h += p.Samples
	}
	for _, b := range probeLast {
		a := getAcc(b.MonitorName)
		if a.statusProbeSet == false {
			a.statusProbe = b.Status
			a.statusProbeSet = true
		}
	}
	for _, d := range probeDaily {
		a := getAcc(d.MonitorName)
		day := a.daily[d.Day]
		if day == nil {
			day = &UptimeHistoryDaily{Day: d.Day}
			a.daily[d.Day] = day
		}
		day.Up += d.Up
		day.Total += d.Total
	}
	// 日志聚合
	for _, l := range log7 {
		a := getAcc(l.ModelName)
		a.hasLog = true
		a.logUps7d += l.Up
		a.logDown7d += l.Down
		if t := l.LastCheckTime(); t.After(a.logLast) {
			a.logLast = t
		}
	}
	for _, l := range log24 {
		a := getAcc(l.ModelName)
		a.hasLog = true
		a.logUps24h += l.Up
		a.logDown24h += l.Down
	}
	for _, d := range logDaily {
		a := getAcc(d.ModelName)
		day := a.daily[d.Day]
		if day == nil {
			day = &UptimeHistoryDaily{Day: d.Day}
			a.daily[d.Day] = day
		}
		day.Up += d.Up
		day.Total += d.Down + d.Up
	}

	// 组装
	groupMap := map[string]*UptimeHistoryGroup{}
	for name, a := range accs {
		category := vendorOf(name)
		if name == "otterl.com 网站" {
			category = "网站可用性"
		}
		group := groupMap[category]
		if group == nil {
			group = &UptimeHistoryGroup{CategoryName: category, Monitors: []UptimeHistoryMonitor{}}
			groupMap[category] = group
		}

		ups7 := a.probeUps7d + a.logUps7d
		samples7 := a.probeSamples7d + a.logUps7d + a.logDown7d
		ups24 := a.probeUps24h + a.logUps24h
		samples24 := a.probeSamples24h + a.logUps24h + a.logDown24h

		m := UptimeHistoryMonitor{
			Name:         name,
			Status:       -1,
			Uptime7d:     uptimePercent(ups7, samples7),
			Uptime24h:    uptimePercent(ups24, samples24),
			Samples7d:    samples7,
			ProbeSamples: a.probeSamples7d,
			LogSamples:   a.logUps7d + a.logDown7d,
			AvgLatencyMs: -1,
			Daily:        []UptimeHistoryDaily{},
		}
		// 当前状态：有探针用探针最近一次；否则用 24h 日志聚合推断
		if a.hasProbe {
			m.Status = a.statusProbe
			if a.probeLast.IsZero() == false {
				t := a.probeLast
				m.LastCheck = &t
			}
		} else if a.hasLog {
			if a.logUps24h > 0 && a.logDown24h == 0 {
				m.Status = 1
			} else if a.logDown24h > 0 {
				m.Status = 0
			}
		}
		if a.logLast.After(a.probeLast) {
			t := a.logLast
			m.LastCheck = &t
		}
		// 平均延迟只来自探针
		if a.probeLatencyCnt > 0 {
			m.AvgLatencyMs = a.probeLatencySum / a.probeLatencyCnt
		}
		// 每日数据（按天排序，最多 30 天）
		days := make([]UptimeHistoryDaily, 0, len(a.daily))
		for _, d := range a.daily {
			days = append(days, *d)
		}
		sort.Slice(days, func(i, j int) bool { return days[i].Day < days[j].Day })
		if len(days) > 30 {
			days = days[len(days)-30:]
		}
		m.Daily = days

		group.Monitors = append(group.Monitors, m)
	}

	groups := make([]UptimeHistoryGroup, 0, len(groupMap))
	for _, g := range groupMap {
		sort.Slice(g.Monitors, func(i, j int) bool {
			if g.Monitors[i].Samples7d != g.Monitors[j].Samples7d {
				return g.Monitors[i].Samples7d > g.Monitors[j].Samples7d
			}
			return g.Monitors[i].Name < g.Monitors[j].Name
		})
		groups = append(groups, *g)
	}
	sort.Slice(groups, func(i, j int) bool {
		return vendorRank(groups[i].CategoryName) < vendorRank(groups[j].CategoryName)
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
