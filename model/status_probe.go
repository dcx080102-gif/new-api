package model

import (
	"time"

	"gorm.io/gorm/clause"
)

// StatusProbeRecord 保存 Uptime Kuma 心跳的原始记录，用于自算可用率。
// Kuma 公开接口只给 24h 可用率，7 日可用率/样本数/延迟由我们累积计算。
type StatusProbeRecord struct {
	ID          int64     `gorm:"primaryKey;autoIncrement" json:"-"`
	MonitorName string    `gorm:"uniqueIndex:idx_probe_name_time;size:150;not null" json:"monitor_name"`
	GroupName   string    `gorm:"index;size:100" json:"group_name"`
	Status      int       `gorm:"not null;default:0" json:"status"` // 1=正常 0=故障
	LatencyMs   int       `gorm:"not null;default:0" json:"latency_ms"`
	BeatTime    time.Time `gorm:"uniqueIndex:idx_probe_name_time;index;not null" json:"beat_time"`
}

func (StatusProbeRecord) TableName() string {
	return "status_probe_records"
}

// SaveStatusProbeRecords 批量插入心跳记录；同监控项同一探测时刻的记录重复采集时忽略。
func SaveStatusProbeRecords(records []StatusProbeRecord) error {
	if len(records) == 0 {
		return nil
	}
	return DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&records).Error
}

// PruneStatusProbeRecords 清理指定时间之前的心跳记录。
func PruneStatusProbeRecords(before time.Time) error {
	return DB.Where("beat_time < ?", before).Delete(&StatusProbeRecord{}).Error
}

// StatusProbeAggregate 某监控项在时间窗口内的聚合结果。
type StatusProbeAggregate struct {
	MonitorName string    `json:"monitor_name"`
	GroupName   string    `json:"group_name"`
	Samples     int64     `json:"samples"`
	Ups         int64     `json:"ups"`
	AvgLatency  float64   `json:"avg_latency_ms"`
	LastCheck   time.Time `json:"last_check"`
}

// GetStatusProbeAggregates 按监控项聚合时间窗口内的探测记录。
func GetStatusProbeAggregates(since time.Time) ([]StatusProbeAggregate, error) {
	var rows []StatusProbeAggregate
	err := DB.Model(&StatusProbeRecord{}).
		Select("monitor_name, MAX(group_name) AS group_name, COUNT(*) AS samples, "+
			"SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS ups, "+
			"AVG(latency_ms) AS avg_latency, MAX(beat_time) AS last_check").
		Where("beat_time >= ?", since).
		Group("monitor_name").
		Scan(&rows).Error
	return rows, err
}

// StatusProbeLastBeat 某监控项最近一次探测的状态。
type StatusProbeLastBeat struct {
	MonitorName string    `json:"monitor_name"`
	Status      int       `json:"status"`
	LatencyMs   int       `json:"latency_ms"`
	BeatTime    time.Time `json:"beat_time"`
}

// GetStatusProbeLastBeats 返回时间窗口内每个监控项的最近一次探测状态。
func GetStatusProbeLastBeats(since time.Time) ([]StatusProbeLastBeat, error) {
	var rows []StatusProbeLastBeat
	sub := DB.Model(&StatusProbeRecord{}).
		Select("MAX(id) AS id").
		Where("beat_time >= ?", since).
		Group("monitor_name")
	err := DB.Model(&StatusProbeRecord{}).
		Select("monitor_name, status, latency_ms, beat_time").
		Where("id IN (?)", sub).
		Scan(&rows).Error
	return rows, err
}

// GetStatusProbeCollectorStats 收集器自身状态（最近一次成功写入时间）。
func GetStatusProbeCollectorStats() (latestBeat time.Time, err error) {
	err = DB.Model(&StatusProbeRecord{}).Select("MAX(beat_time)").Scan(&latestBeat).Error
	return
}
