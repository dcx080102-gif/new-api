package controller

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"

	"github.com/gin-gonic/gin"
)

// HealthResponse 健康检查响应结构
type HealthResponse struct {
	Status string `json:"status"`
	Uptime string `json:"uptime"`
}

// ReadyResponse 就绪检查响应结构
type ReadyResponse struct {
	Status   string `json:"status"`
	Postgres string `json:"postgres,omitempty"`
	Mysql    string `json:"mysql,omitempty"`
	Sqlite   string `json:"sqlite,omitempty"`
	Redis    string `json:"redis,omitempty"`
	Uptime   string `json:"uptime"`
}

// formatUptime 格式化运行时间
func formatUptime() string {
	seconds := time.Now().Unix() - common.StartTime
	if seconds < 0 {
		seconds = 0
	}

	days := seconds / 86400
	hours := (seconds % 86400) / 3600
	minutes := (seconds % 3600) / 60

	if days > 0 {
		return fmt.Sprintf("%dd%dh", days, hours)
	}
	if hours > 0 {
		return fmt.Sprintf("%dh%dm", hours, minutes)
	}
	return fmt.Sprintf("%dm", minutes)
}

// GetHealth 基础健康检查 — 返回服务运行状态
func GetHealth(c *gin.Context) {
	c.JSON(http.StatusOK, HealthResponse{
		Status: "ok",
		Uptime: formatUptime(),
	})
}

// GetHealthReady 就绪检查 — 检查所依赖服务（数据库、Redis）连接状态
func GetHealthReady(c *gin.Context) {
	resp := ReadyResponse{
		Status: "ok",
		Uptime: formatUptime(),
	}

	// 建立短超时上下文，避免检查卡死
	ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
	defer cancel()

	// --- 数据库连接检查 ---
	var dbStatus string
	if model.DB != nil {
		sqlDB, err := model.DB.DB()
		if err != nil {
			dbStatus = fmt.Sprintf("error: %v", err)
		} else {
			if err := sqlDB.PingContext(ctx); err != nil {
				dbStatus = fmt.Sprintf("error: %v", err)
			} else {
				dbStatus = "ok"
			}
		}
	} else {
		dbStatus = "not_initialized"
	}

	// 按数据库类型填充对应字段
	if common.UsingPostgreSQL {
		resp.Postgres = dbStatus
	} else if common.UsingMySQL {
		resp.Mysql = dbStatus
	} else {
		resp.Sqlite = dbStatus
	}

	if dbStatus != "ok" {
		resp.Status = "degraded"
		common.SysLog(fmt.Sprintf("[HEALTH] 数据库连接异常: %s", dbStatus))
	}

	// --- Redis 连接检查 ---
	var redisStatus string
	if !common.RedisEnabled {
		redisStatus = "disabled"
	} else if common.RDB != nil {
		if _, err := common.RDB.Ping(ctx).Result(); err != nil {
			redisStatus = fmt.Sprintf("error: %v", err)
			resp.Status = "degraded"
			common.SysLog(fmt.Sprintf("[HEALTH] Redis 连接异常: %s", redisStatus))
		} else {
			redisStatus = "ok"
		}
	} else {
		redisStatus = "not_initialized"
	}
	resp.Redis = redisStatus

	// 任何依赖异常返回 503；全部正常返回 200
	statusCode := http.StatusOK
	if resp.Status != "ok" {
		statusCode = http.StatusServiceUnavailable
	}
	c.JSON(statusCode, resp)
}
