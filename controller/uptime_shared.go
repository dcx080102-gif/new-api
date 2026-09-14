package controller

import (
	"sort"
	"strconv"
	"strings"
	"time"

	perfmetrics "github.com/QuantumNous/new-api/pkg/perf_metrics"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
)

// buildUptimeInfo 合并主动探针（status_probe_records）与真实调用日志（logs 被动聚合），
// 计算单个模型的可用性信息。模型无真实流量时探针数据仍可提供公开可见的可用率。
// 供 /api/perf-metrics（模型详情·性能）与 /api/uptime/history 复用同一套口径。
func buildUptimeInfo(name string) (*perfmetrics.UptimeInfo, error) {
	now := time.Now()
	since7d := now.Add(-7 * 24 * time.Hour)
	since24h := now.Add(-24 * time.Hour)
	since30d := now.Add(-30 * 24 * time.Hour)

	common.OptionMapRWMutex.RLock()
	passiveRaw := common.OptionMap["status_passive_since"]
	common.OptionMapRWMutex.RUnlock()
	passiveSince, _ := strconv.ParseInt(strings.TrimSpace(passiveRaw), 10, 64)
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

	var (
		probeUps7d, probeSamples7d       int64
		probeUps24h, probeSamples24h     int64
		probeLatencySum, probeLatencyCnt float64
		probeLast                        time.Time
		statusProbe                      int
		hasProbe                         bool
		logUps7d, logDown7d              int64
		logUps24h, logDown24h            int64
		logLast                          time.Time
		hasLog                           bool
		dailyMap                         = map[string]*perfmetrics.UptimeDay{}
	)

	probe7, err := model.GetStatusProbeAggregates(since7d)
	if err != nil {
		return nil, err
	}
	for _, p := range probe7 {
		if p.MonitorName != name {
			continue
		}
		hasProbe = true
		probeUps7d += p.Ups
		probeSamples7d += p.Samples
		probeLatencySum += p.AvgLatency * float64(p.Samples)
		probeLatencyCnt += float64(p.Samples)
		if p.LastCheck.After(probeLast) {
			probeLast = p.LastCheck
		}
	}
	probe24, err := model.GetStatusProbeAggregates(since24h)
	if err != nil {
		return nil, err
	}
	for _, p := range probe24 {
		if p.MonitorName != name {
			continue
		}
		hasProbe = true
		probeUps24h += p.Ups
		probeSamples24h += p.Samples
	}
	probeLastBeats, err := model.GetStatusProbeLastBeats(since7d)
	if err != nil {
		return nil, err
	}
	for _, b := range probeLastBeats {
		if b.MonitorName == name {
			statusProbe = b.Status
			break
		}
	}
	probeDaily, err := model.GetStatusProbeDailyAggregates(since30d)
	if err != nil {
		return nil, err
	}
	for _, d := range probeDaily {
		if d.MonitorName != name {
			continue
		}
		day := dailyMap[d.Day]
		if day == nil {
			day = &perfmetrics.UptimeDay{Day: d.Day}
			dailyMap[d.Day] = day
		}
		day.Up += d.Up
		day.Total += d.Total
	}
	log7, err := model.GetLogPassiveAggregates(logSince7)
	if err != nil {
		return nil, err
	}
	for _, l := range log7 {
		if l.ModelName != name {
			continue
		}
		hasLog = true
		logUps7d += l.Up
		logDown7d += l.Down
		if t := l.LastCheckTime(); t.After(logLast) {
			logLast = t
		}
	}
	log24, err := model.GetLogPassiveAggregates(logSince24)
	if err != nil {
		return nil, err
	}
	for _, l := range log24 {
		if l.ModelName != name {
			continue
		}
		hasLog = true
		logUps24h += l.Up
		logDown24h += l.Down
	}
	logDaily, err := model.GetLogPassiveDailyAggregates(logSince30)
	if err != nil {
		return nil, err
	}
	for _, d := range logDaily {
		if d.ModelName != name {
			continue
		}
		day := dailyMap[d.Day]
		if day == nil {
			day = &perfmetrics.UptimeDay{Day: d.Day}
			dailyMap[d.Day] = day
		}
		day.Up += d.Up
		day.Total += d.Up + d.Down
	}

	info := &perfmetrics.UptimeInfo{
		Status:       -1,
		Uptime7d:     -1,
		Uptime24h:    -1,
		AvgLatencyMs: -1,
		Daily:        []perfmetrics.UptimeDay{},
	}
	ups7 := probeUps7d + logUps7d
	samples7 := probeSamples7d + logUps7d + logDown7d
	ups24 := probeUps24h + logUps24h
	samples24 := probeSamples24h + logUps24h + logDown24h
	info.Uptime7d = uptimePercent(ups7, samples7)
	info.Uptime24h = uptimePercent(ups24, samples24)
	info.Samples = samples7
	info.ProbeSamples = probeSamples7d
	info.LogSamples = logUps7d + logDown7d
	if hasProbe {
		info.Status = statusProbe
	} else if hasLog {
		if logUps24h > 0 && logDown24h == 0 {
			info.Status = 1
		} else if logDown24h > 0 {
			info.Status = 0
		}
	}
	if probeLatencyCnt > 0 {
		info.AvgLatencyMs = probeLatencySum / probeLatencyCnt
	}
	last := probeLast
	if logLast.After(last) {
		last = logLast
	}
	if !last.IsZero() {
		info.LastCheckUnix = last.Unix()
	}
	days := make([]perfmetrics.UptimeDay, 0, len(dailyMap))
	for _, d := range dailyMap {
		days = append(days, *d)
	}
	sort.Slice(days, func(i, j int) bool { return days[i].Day < days[j].Day })
	if len(days) > 30 {
		days = days[len(days)-30:]
	}
	info.Daily = days
	return info, nil
}

// buildAllUptimeModels 批量计算所有有监测数据模型的可用性（主动探针 + 被动日志双源）。
// 只查询固定次数（每源 3-4 次聚合），合并输出，供 /api/perf-metrics/summary 的
// uptime_models 字段使用（首页「服务状态」区块与采集方复用）。
func buildAllUptimeModels() ([]perfmetrics.UptimeModel, error) {
	now := time.Now()
	since7d := now.Add(-7 * 24 * time.Hour)
	since24h := now.Add(-24 * time.Hour)
	since30d := now.Add(-30 * 24 * time.Hour)

	common.OptionMapRWMutex.RLock()
	passiveRaw := common.OptionMap["status_passive_since"]
	common.OptionMapRWMutex.RUnlock()
	passiveSince, _ := strconv.ParseInt(strings.TrimSpace(passiveRaw), 10, 64)
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

	// 每个模型一份累加器
	type acc struct {
		probeUps7d, probeSamples7d   int64
		probeUps24h, probeSamples24h int64
		probeLatencySum, probeCnt    float64
		probeLast                    time.Time
		statusProbe                  int
		hasProbe                     bool
		logUps7d, logDown7d          int64
		logUps24h, logDown24h        int64
		logLast                      time.Time
		hasLog                       bool
		daily                        map[string]*perfmetrics.UptimeDay
	}
	accs := map[string]*acc{}
	getAcc := func(name string) *acc {
		a := accs[name]
		if a == nil {
			a = &acc{daily: map[string]*perfmetrics.UptimeDay{}}
			accs[name] = a
		}
		return a
	}

	probe7, err := model.GetStatusProbeAggregates(since7d)
	if err != nil {
		return nil, err
	}
	for _, p := range probe7 {
		a := getAcc(p.MonitorName)
		a.hasProbe = true
		a.probeUps7d += p.Ups
		a.probeSamples7d += p.Samples
		a.probeLatencySum += p.AvgLatency * float64(p.Samples)
		a.probeCnt += float64(p.Samples)
		if p.LastCheck.After(a.probeLast) {
			a.probeLast = p.LastCheck
		}
	}
	probe24, err := model.GetStatusProbeAggregates(since24h)
	if err != nil {
		return nil, err
	}
	for _, p := range probe24 {
		a := getAcc(p.MonitorName)
		a.hasProbe = true
		a.probeUps24h += p.Ups
		a.probeSamples24h += p.Samples
	}
	probeLastBeats, err := model.GetStatusProbeLastBeats(since7d)
	if err != nil {
		return nil, err
	}
	for _, b := range probeLastBeats {
		a := getAcc(b.MonitorName)
		if !a.hasProbe {
			a.hasProbe = true
		}
		a.statusProbe = b.Status
	}
	probeDaily, err := model.GetStatusProbeDailyAggregates(since30d)
	if err != nil {
		return nil, err
	}
	for _, d := range probeDaily {
		a := getAcc(d.MonitorName)
		day := a.daily[d.Day]
		if day == nil {
			day = &perfmetrics.UptimeDay{Day: d.Day}
			a.daily[d.Day] = day
		}
		day.Up += d.Up
		day.Total += d.Total
	}
	log7, err := model.GetLogPassiveAggregates(logSince7)
	if err != nil {
		return nil, err
	}
	for _, l := range log7 {
		a := getAcc(l.ModelName)
		a.hasLog = true
		a.logUps7d += l.Up
		a.logDown7d += l.Down
		if t := l.LastCheckTime(); t.After(a.logLast) {
			a.logLast = t
		}
	}
	log24, err := model.GetLogPassiveAggregates(logSince24)
	if err != nil {
		return nil, err
	}
	for _, l := range log24 {
		a := getAcc(l.ModelName)
		a.hasLog = true
		a.logUps24h += l.Up
		a.logDown24h += l.Down
	}
	logDaily, err := model.GetLogPassiveDailyAggregates(logSince30)
	if err != nil {
		return nil, err
	}
	for _, d := range logDaily {
		a := getAcc(d.ModelName)
		day := a.daily[d.Day]
		if day == nil {
			day = &perfmetrics.UptimeDay{Day: d.Day}
			a.daily[d.Day] = day
		}
		day.Up += d.Up
		day.Total += d.Up + d.Down
	}

	out := make([]perfmetrics.UptimeModel, 0, len(accs))
	for name, a := range accs {
		// 网站监控项不是模型，跳过
		if name == "otterl.com 网站" {
			continue
		}
		// 无任何样本的模型不输出（诚实原则：不把无数据伪装成正常）
		if a.probeSamples7d == 0 && a.logUps7d == 0 && a.logDown7d == 0 {
			continue
		}
		info := &perfmetrics.UptimeInfo{
			Status:       -1,
			Uptime7d:     -1,
			Uptime24h:    -1,
			AvgLatencyMs: -1,
			Daily:        []perfmetrics.UptimeDay{},
		}
		ups7 := a.probeUps7d + a.logUps7d
		samples7 := a.probeSamples7d + a.logUps7d + a.logDown7d
		ups24 := a.probeUps24h + a.logUps24h
		samples24 := a.probeSamples24h + a.logUps24h + a.logDown24h
		info.Uptime7d = uptimePercent(ups7, samples7)
		info.Uptime24h = uptimePercent(ups24, samples24)
		info.Samples = samples7
		info.ProbeSamples = a.probeSamples7d
		info.LogSamples = a.logUps7d + a.logDown7d
		if a.hasProbe {
			info.Status = a.statusProbe
		} else if a.hasLog {
			if a.logUps24h > 0 && a.logDown24h == 0 {
				info.Status = 1
			} else if a.logDown24h > 0 {
				info.Status = 0
			}
		}
		if a.probeCnt > 0 {
			info.AvgLatencyMs = a.probeLatencySum / a.probeCnt
		}
		last := a.probeLast
		if a.logLast.After(last) {
			last = a.logLast
		}
		if !last.IsZero() {
			info.LastCheckUnix = last.Unix()
		}
		days := make([]perfmetrics.UptimeDay, 0, len(a.daily))
		for _, d := range a.daily {
			days = append(days, *d)
		}
		sort.Slice(days, func(i, j int) bool { return days[i].Day < days[j].Day })
		if len(days) > 30 {
			days = days[len(days)-30:]
		}
		info.Daily = days
		out = append(out, perfmetrics.UptimeModel{ModelName: name, Uptime: info})
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Uptime.Samples != out[j].Uptime.Samples {
			return out[i].Uptime.Samples > out[j].Uptime.Samples
		}
		return out[i].ModelName < out[j].ModelName
	})
	return out, nil
}
