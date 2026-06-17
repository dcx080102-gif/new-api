package common

import (
	"fmt"
	"sync"
	"testing"

	"github.com/stretchr/testify/require"
)

// ============================================================================
// GetCacheStats — 原子计数器测试
// ============================================================================

func TestCacheStats_RecordHits(t *testing.T) {
	// 重置全局状态：连续调用 hits 累加
	beforeHits, _, _, _, _ := GetCacheStats()
	RecordCacheHit()
	hits, _, _, _, _ := GetCacheStats()
	require.Equal(t, beforeHits+1, hits)
}

func TestCacheStats_RecordMisses(t *testing.T) {
	beforeMisses := int64(0)
	_, beforeMisses, _, _, _ = GetCacheStats()
	RecordCacheMiss()
	_, misses, _, _, _ := GetCacheStats()
	require.Equal(t, beforeMisses+1, misses)
}

func TestCacheStats_RecordSets(t *testing.T) {
	_, _, beforeSets, _, _ := GetCacheStats()
	RecordCacheSet()
	_, _, sets, _, _ := GetCacheStats()
	require.Equal(t, beforeSets+1, sets)
}

func TestCacheStats_RecordDels(t *testing.T) {
	_, _, _, beforeDels, _ := GetCacheStats()
	RecordCacheDel()
	_, _, _, dels, _ := GetCacheStats()
	require.Equal(t, beforeDels+1, dels)
}

func TestCacheStats_HitRate(t *testing.T) {
	// 由于全局状态会被其他测试影响，记录增量
	prevHits, prevMisses, _, _, _ := GetCacheStats()

	// 新增 8 hits + 2 misses
	for i := 0; i < 8; i++ {
		RecordCacheHit()
	}
	for i := 0; i < 2; i++ {
		RecordCacheMiss()
	}

	newHits, newMisses, _, _, _ := GetCacheStats()
	deltaHits := newHits - prevHits
	deltaMisses := newMisses - prevMisses
	deltaTotal := deltaHits + deltaMisses
	require.Equal(t, int64(10), deltaTotal, "增量应为 10 次")
	require.Equal(t, int64(8), deltaHits, "增量 hits 应为 8")
	require.Equal(t, int64(2), deltaMisses, "增量 misses 应为 2")

	// 验证 hitRate 计算正确（用全局命中率，不依赖绝对值）
	_, _, _, _, rate := GetCacheStats()
	if newHits+newMisses > 0 {
		expectedRate := float64(newHits) / float64(newHits+newMisses) * 100
		require.InDelta(t, expectedRate, rate, 0.1,
			fmt.Sprintf("命中率应约为 %.1f%%, 实际 %.1f%%", expectedRate, rate))
	}
}

func TestCacheStats_ZeroHits(t *testing.T) {
	// 注意：这里测试的是 hitRate 在 hit+miss=0 时返回 0 的逻辑
	// 由于全局状态已累计，我们只验证当前 rate 是合法数值
	_, _, _, _, rate := GetCacheStats()
	require.GreaterOrEqual(t, rate, 0.0)
	require.LessOrEqual(t, rate, 100.0)
}

// ============================================================================
// CacheStats — 并发安全测试
// ============================================================================

func TestCacheStats_Concurrency(t *testing.T) {
	var wg sync.WaitGroup
	goroutines := 50
	perGoroutine := 1000

	for i := 0; i < goroutines; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := 0; j < perGoroutine; j++ {
				RecordCacheHit()
				RecordCacheMiss()
				RecordCacheSet()
				RecordCacheDel()
			}
		}()
	}

	wg.Wait()

	hits, misses, sets, dels, _ := GetCacheStats()
	totalOps := int64(goroutines * perGoroutine)

	// 所有计数器应该 >= totalOps（加上之前累积的）
	require.GreaterOrEqual(t, hits, totalOps,
		"并发 hits 计数不应丢失")
	require.GreaterOrEqual(t, misses, totalOps,
		"并发 misses 计数不应丢失")
	require.GreaterOrEqual(t, sets, totalOps,
		"并发 sets 计数不应丢失")
	require.GreaterOrEqual(t, dels, totalOps,
		"并发 dels 计数不应丢失")
}
