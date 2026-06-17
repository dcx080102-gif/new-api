package common

import (
	"context"
	"fmt"
	"sync/atomic"
	"time"

	"github.com/go-redis/redis/v8"
)

// ────────────────────────────────────────────────────────────
// 通用 Redis 缓存封装（带 RedisEnabled 安全检查和 nil 防护）
// ────────────────────────────────────────────────────────────

// CacheGet 从 Redis 读取缓存值。
// Redis 未启用时返回 redis.Nil 模拟"未命中"。
func CacheGet(key string) (string, error) {
	if !RedisEnabled || RDB == nil {
		return "", redis.Nil
	}
	ctx := context.Background()
	val, err := RDB.Get(ctx, key).Result()
	return val, err
}

// CacheSet 写入 Redis 缓存，设置过期时间。
// Redis 未启用时静默跳过。
func CacheSet(key string, value string, ttl time.Duration) error {
	if !RedisEnabled || RDB == nil {
		return nil
	}
	ctx := context.Background()
	return RDB.Set(ctx, key, value, ttl).Err()
}

// CacheDelete 删除 Redis 缓存 key。
// Redis 未启用时静默跳过。
func CacheDelete(key string) error {
	if !RedisEnabled || RDB == nil {
		return nil
	}
	ctx := context.Background()
	return RDB.Del(ctx, key).Err()
}

// CacheDeletePattern 删除匹配 pattern 的所有 key。
// 使用 SCAN 遍历，避免 KEYS 阻塞线上 Redis。
func CacheDeletePattern(pattern string) (int64, error) {
	if !RedisEnabled || RDB == nil {
		return 0, nil
	}
	ctx := context.Background()
	var deleted int64
	iter := RDB.Scan(ctx, 0, pattern, 100).Iterator()
	for iter.Next(ctx) {
		if err := RDB.Del(ctx, iter.Val()).Err(); err != nil {
			return deleted, err
		}
		deleted++
	}
	return deleted, iter.Err()
}

// ────────────────────────────────────────────────────────────
// 缓存命中率统计
// ────────────────────────────────────────────────────────────

// CacheStats 缓存统计计数器（原子操作，无锁）
type CacheStats struct {
	hits   atomic.Int64
	misses atomic.Int64
	sets   atomic.Int64
	dels   atomic.Int64
}

var (
	// 全局统计实例
	globalCacheStats CacheStats
)

// RecordCacheHit 记录一次缓存命中
func RecordCacheHit() {
	globalCacheStats.hits.Add(1)
}

// RecordCacheMiss 记录一次缓存未命中
func RecordCacheMiss() {
	globalCacheStats.misses.Add(1)
}

// RecordCacheSet 记录一次缓存写入
func RecordCacheSet() {
	globalCacheStats.sets.Add(1)
}

// RecordCacheDel 记录一次缓存删除
func RecordCacheDel() {
	globalCacheStats.dels.Add(1)
}

// GetCacheStats 获取当前缓存统计信息
func GetCacheStats() (hits, misses, sets, dels int64, hitRate float64) {
	h := globalCacheStats.hits.Load()
	m := globalCacheStats.misses.Load()
	s := globalCacheStats.sets.Load()
	d := globalCacheStats.dels.Load()
	total := h + m
	if total > 0 {
		hitRate = float64(h) / float64(total) * 100
	}
	return h, m, s, d, hitRate
}

// LogCacheStats 打印缓存统计日志（建议定时调用）
func LogCacheStats() {
	h, m, s, d, rate := GetCacheStats()
	SysLog(fmt.Sprintf("[Redis缓存统计] 命中=%d 未命中=%d 命中率=%.1f%% 写入=%d 删除=%d",
		h, m, rate, s, d))
}

// StartCacheStatsLogger 启动定期缓存统计日志输出（每 5 分钟打印一次）
func StartCacheStatsLogger(interval time.Duration) {
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for range ticker.C {
			LogCacheStats()
		}
	}()
	SysLog(fmt.Sprintf("[Redis缓存统计] 统计日志已启动，间隔=%v", interval))
}
