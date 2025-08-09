
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

export function useDataRefresh() {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState<number>(2 * 60 * 1000) // 2 minutes for faster updates
  const [autoRefresh, setAutoRefresh] = useState(true)

  const refreshData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      // Simulate real-time data updates with more realistic market movements
      const timestamp = new Date().toISOString()
      
      // Update all assets with new data
      const { list: assets } = await lumi.entities.assets.list()
      
      for (const asset of assets) {
        // More realistic price variations based on asset type
        const baseVolatility = asset.type === 'crypto' ? 0.08 : 0.03 // Crypto more volatile
        const priceVariation = (Math.random() - 0.5) * baseVolatility
        
        // Sentiment can change more dramatically
        const sentimentVariation = (Math.random() - 0.5) * 0.3
        
        // Confidence tends to be more stable
        const confidenceVariation = (Math.random() - 0.5) * 0.1
        
        // Volume variation
        const volumeVariation = 1 + (Math.random() - 0.5) * 0.5
        
        const updatedAsset = {
          ...asset,
          currentPrice: Math.max(0.000001, asset.currentPrice * (1 + priceVariation)),
          priceChange24h: asset.priceChange24h + (Math.random() - 0.5) * 4, // ±2% change
          sentimentScore: Math.max(-1, Math.min(1, asset.sentimentScore + sentimentVariation)),
          confidenceLevel: Math.max(10, Math.min(100, asset.confidenceLevel + confidenceVariation * 20)),
          volume24h: asset.volume24h ? asset.volume24h * volumeVariation : undefined,
          lastAnalyzed: timestamp,
          updatedAt: timestamp
        }
        
        await lumi.entities.assets.update(asset._id, updatedAsset)
      }
      
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to refresh data:', error)
      toast.error('Failed to refresh live data')
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const manualRefresh = useCallback(async () => {
    await refreshData()
    toast.success('Data refreshed successfully')
  }, [refreshData])

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev)
    if (!autoRefresh) {
      toast.success('Auto-refresh enabled')
    } else {
      toast.success('Auto-refresh disabled')
    }
  }, [autoRefresh])

  const setCustomInterval = useCallback((minutes: number) => {
    const newInterval = minutes * 60 * 1000
    setRefreshInterval(newInterval)
    toast.success(`Refresh interval set to ${minutes} minute${minutes !== 1 ? 's' : ''}`)
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    // Initial refresh
    refreshData()
    
    // Set up interval for automatic refresh
    const interval = setInterval(refreshData, refreshInterval)
    
    return () => clearInterval(interval)
  }, [refreshData, refreshInterval, autoRefresh])

  const getNextRefreshTime = () => {
    if (!autoRefresh) return null
    return new Date(lastRefresh.getTime() + refreshInterval)
  }

  const getTimeUntilNextRefresh = () => {
    if (!autoRefresh) return null
    const nextRefresh = getNextRefreshTime()
    if (!nextRefresh) return null
    
    const now = new Date()
    const diff = nextRefresh.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / 1000)) // seconds
  }

  return {
    lastRefresh,
    isRefreshing,
    autoRefresh,
    refreshInterval: refreshInterval / (60 * 1000), // return in minutes
    refreshData: manualRefresh,
    toggleAutoRefresh,
    setRefreshInterval: setCustomInterval,
    getNextRefreshTime,
    getTimeUntilNextRefresh
  }
}
