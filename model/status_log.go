package model

import (
	"fmt"
	"time"

	"gorm.io/gorm"

	"github.com/QuantumNous/new-api/common"
)

// 被动聚合：从真实调用日志（logs 表）计算模型可用性，零探针成本。
// 与主动探针（status_probe_records）互为补充：有客户流量的模型天然获得大量样本。
//
// 判定规则（只统计能明确判定的行，未知状态不计入）：
//   成功：content 为空（正常完成）、'模型测试%'（渠道测试按钮）、'品质%'（生图成功）
//   失败：content 以 'status_code=%' 开头（含错误码）、'上游没有返回计费信息%'（上游超时）
// 排除：状态探针 token 的请求（token_name = '状态探针-自动'），避免探针流量自我循环。

const statusProbeTokenName = "状态探针-自动"

// StatusLogDaily 某模型某天的被动聚合结果。
type StatusLogDaily struct {
	ModelName string `json:"model_name"`
	Day       string `json:"day"`
	Up        int64  `json:"up"`
	Down      int64  `json:"down"`
}

// StatusLogAggregate 某模型在时间窗口内的被动聚合结果（LastEpoch 为 unix 秒）。
type StatusLogAggregate struct {
	ModelName string `json:"model_name"`
	Up        int64  `json:"up"`
	Down      int64  `json:"down"`
	LastEpoch int64  `json:"last_epoch"`
}

// LastCheckTime 返回最近一次真实调用的时间。
func (a StatusLogAggregate) LastCheckTime() time.Time {
	if a.LastEpoch <= 0 {
		return time.Time{}
	}
	return time.Unix(a.LastEpoch, 0)
}

func logDayExpr() string {
	switch {
	case common.UsingPostgreSQL:
		return "to_char(date_trunc('day', to_timestamp(created_at)), 'YYYY-MM-DD')"
	case common.UsingMySQL:
		return "DATE_FORMAT(FROM_UNIXTIME(created_at), '%Y-%m-%d')"
	default: // SQLite
		return "strftime('%Y-%m-%d', created_at, 'unixepoch')"
	}
}

// 跨库的成败判定表达式（只算可判定行）。
const logUpCase = "SUM(CASE WHEN content='' OR content LIKE '模型测试%' OR content LIKE '品质%' THEN 1 ELSE 0 END)"
const logDownCase = "SUM(CASE WHEN content LIKE 'status_code=%' OR content LIKE '上游没有返回计费信息%' THEN 1 ELSE 0 END)"

func logBaseQuery() *gorm.DB {
	return LOG_DB.Model(&Log{}).
		Where("model_name <> ''").
		Where("token_name <> ?", statusProbeTokenName)
}

// GetLogPassiveDailyAggregates 按模型、按天聚合真实调用日志（用于 30 天可用率条）。
func GetLogPassiveDailyAggregates(sinceEpoch int64) ([]StatusLogDaily, error) {
	var rows []StatusLogDaily
	err := logBaseQuery().
		Select(fmt.Sprintf("model_name, %s AS day, %s AS up, %s AS down",
			logDayExpr(), logUpCase, logDownCase)).
		Where("created_at >= ?", sinceEpoch).
		Group("model_name, day").
		Order("day ASC").
		Scan(&rows).Error
	return rows, err
}

// GetLogPassiveAggregates 按模型聚合时间窗口内的真实调用日志。
func GetLogPassiveAggregates(sinceEpoch int64) ([]StatusLogAggregate, error) {
	var rows []StatusLogAggregate
	err := logBaseQuery().
		Select(fmt.Sprintf("model_name, %s AS up, %s AS down, MAX(created_at) AS last_epoch",
			logUpCase, logDownCase)).
		Where("created_at >= ?", sinceEpoch).
		Group("model_name").
		Scan(&rows).Error
	return rows, err
}
