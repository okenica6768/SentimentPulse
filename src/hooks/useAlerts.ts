
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { lumi } from '../lib/lumi'
import { Alert, Asset } from '../types/Asset'
import toast from 'react-hot-toast'

interface AlertConfig {
  assetSymbol: string
  type: 'price_up' | 'price_down' | 'sentiment_change' | 'volume_spike'
  threshold: number
  enabled: boolean
}

export function useAlerts() {
  const { user, isAuthenticated } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch user alerts
  const fetchAlerts = useCallback(async () => {
    if (!isAuthenticated || !user) return

    try {
      setLoading(true)
      const { list } = await lumi.entities.alerts?.list() || { list: [] }
      const userAlerts = list.filter((alert: Alert) => alert.userId === user.userId)
      setAlerts(userAlerts)
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  // Create new alert
  const createAlert = useCallback(async (config: AlertConfig) => {
    if (!isAuthenticated || !user) {
      toast.error('Please sign in to create alerts')
      return false
    }

    try {
      const alertData = {
        userId: user.userId,
        assetSymbol: config.assetSymbol,
        type: config.type,
        threshold: config.threshold,
        currentValue: 0, // Will be updated by monitoring
        triggered: false,
        message: generateAlertMessage(config),
        createdAt: new Date().toISOString(),
        creator: user.userId
      }

      await lumi.entities.alerts?.create(alertData)
      await fetchAlerts()
      toast.success(`Alert created for ${config.assetSymbol}`)
      return true
    } catch (error) {
      console.error('Failed to create alert:', error)
      toast.error('Failed to create alert')
      return false
    }
  }, [isAuthenticated, user, fetchAlerts])

  // Update alert
  const updateAlert = useCallback(async (alertId: string, updates: Partial<Alert>) => {
    try {
      await lumi.entities.alerts?.update(alertId, updates)
      await fetchAlerts()
      toast.success('Alert updated')
    } catch (error) {
      console.error('Failed to update alert:', error)
      toast.error('Failed to update alert')
    }
  }, [fetchAlerts])

  // Delete alert
  const deleteAlert = useCallback(async (alertId: string) => {
    try {
      await lumi.entities.alerts?.delete(alertId)
      await fetchAlerts()
      toast.success('Alert deleted')
    } catch (error) {
      console.error('Failed to delete alert:', error)
      toast.error('Failed to delete alert')
    }
  }, [fetchAlerts])

  // Monitor assets and trigger alerts
  const monitorAlerts = useCallback(async (assets: Asset[]) => {
    if (alerts.length === 0) return

    const activeAlerts = alerts.filter(alert => !alert.triggered)

    for (const alert of activeAlerts) {
      const asset = assets.find(a => a.symbol === alert.assetSymbol)
      if (!asset) continue

      let shouldTrigger = false
      let currentValue = 0

      switch (alert.type) {
        case 'price_up':
          currentValue = asset.currentPrice
          shouldTrigger = currentValue >= alert.threshold
          break
        case 'price_down':
          currentValue = asset.currentPrice
          shouldTrigger = currentValue <= alert.threshold
          break
        case 'sentiment_change':
          currentValue = asset.sentimentScore * 100
          shouldTrigger = Math.abs(currentValue) >= alert.threshold
          break
        case 'volume_spike':
          currentValue = asset.volume24h || 0
          shouldTrigger = currentValue >= alert.threshold
          break
      }

      if (shouldTrigger) {
        // Trigger alert
        await updateAlert(alert._id!, {
          triggered: true,
          currentValue,
          triggeredAt: new Date().toISOString()
        })

        // Show notification
        const message = `🚨 ${alert.assetSymbol}: ${alert.message}`
        toast.success(message, { duration: 6000 })

        // Play notification sound (optional)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('SentimentPulse Alert', {
            body: message,
            icon: '/favicon.ico'
          })
        }
      } else {
        // Update current value
        await updateAlert(alert._id!, { currentValue })
      }
    }
  }, [alerts, updateAlert])

  // Generate alert message
  const generateAlertMessage = (config: AlertConfig): string => {
    switch (config.type) {
      case 'price_up':
        return `Price reached $${config.threshold.toLocaleString()}`
      case 'price_down':
        return `Price dropped to $${config.threshold.toLocaleString()}`
      case 'sentiment_change':
        return `Sentiment changed significantly (${config.threshold}%)`
      case 'volume_spike':
        return `Volume spike detected (${config.threshold.toLocaleString()})`
      default:
        return 'Alert triggered'
    }
  }

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        toast.success('Notifications enabled')
      } else {
        toast.error('Notifications denied')
      }
    }
  }, [])

  // Bulk alert operations
  const createBulkAlerts = useCallback(async (configs: AlertConfig[]) => {
    const results = await Promise.allSettled(
      configs.map(config => createAlert(config))
    )
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length
    const failed = results.length - successful
    
    if (successful > 0) {
      toast.success(`Created ${successful} alerts`)
    }
    if (failed > 0) {
      toast.error(`Failed to create ${failed} alerts`)
    }
  }, [createAlert])

  const deleteTriggeredAlerts = useCallback(async () => {
    const triggeredAlerts = alerts.filter(alert => alert.triggered)
    await Promise.all(triggeredAlerts.map(alert => deleteAlert(alert._id!)))
    toast.success(`Cleared ${triggeredAlerts.length} triggered alerts`)
  }, [alerts, deleteAlert])

  // Alert statistics
  const getAlertStats = useCallback(() => {
    const total = alerts.length
    const active = alerts.filter(alert => !alert.triggered).length
    const triggered = alerts.filter(alert => alert.triggered).length
    
    const byType = alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total, active, triggered, byType }
  }, [alerts])

  // Quick alert templates
  const getAlertTemplates = useCallback((asset: Asset): AlertConfig[] => {
    const currentPrice = asset.currentPrice
    
    return [
      {
        assetSymbol: asset.symbol,
        type: 'price_up',
        threshold: currentPrice * 1.05, // 5% increase
        enabled: true
      },
      {
        assetSymbol: asset.symbol,
        type: 'price_down',
        threshold: currentPrice * 0.95, // 5% decrease
        enabled: true
      },
      {
        assetSymbol: asset.symbol,
        type: 'sentiment_change',
        threshold: 20, // 20% sentiment change
        enabled: true
      },
      {
        assetSymbol: asset.symbol,
        type: 'volume_spike',
        threshold: (asset.volume24h || 1000000) * 2, // 2x volume
        enabled: true
      }
    ]
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlerts()
      requestNotificationPermission()
    }
  }, [isAuthenticated, fetchAlerts, requestNotificationPermission])

  return {
    alerts,
    alertConfigs,
    loading,
    createAlert,
    updateAlert,
    deleteAlert,
    monitorAlerts,
    createBulkAlerts,
    deleteTriggeredAlerts,
    getAlertStats,
    getAlertTemplates,
    requestNotificationPermission
  }
}
