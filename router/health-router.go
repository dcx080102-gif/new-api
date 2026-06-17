package router

import (
	"github.com/QuantumNous/new-api/controller"

	"github.com/gin-gonic/gin"
)

// SetHealthRouter 注册健康检查相关路由
// 端点在根路径，独立于 /api 组，不需要认证
func SetHealthRouter(router *gin.Engine) {
	router.GET("/health", controller.GetHealth)
	router.GET("/health/ready", controller.GetHealthReady)
}
