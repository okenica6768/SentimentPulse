
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Plus, Play, Pause, Edit, Trash2, TrendingUp, DollarSign, Volume2, Newspaper } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import toast from 'react-hot-toast'

interface Alert {
  id: string
  type: 'sentiment' | 'price' | 'volume' | 'news'
  asset: string
  condition: string
  status: 'active' | 'paused' | 'triggered'
  createdAt: string
  lastTriggered?: string
}

export default function Alerts() {
  const { isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlerts()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchAlerts = async () => {
    // Mock data for now
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'sentiment',
        asset: 'AAPL',
        condition: 'Sentiment drops below 40%',
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        type: 'price',
        asset: 'BTC',
        condition: 'Price increases by 5%',
        status: 'triggered',
        createdAt: '2024-01-14T15:30:00Z',
        lastTriggered: '2024-01-16T09:15:00Z'
      },
      {
        id: '3',
        type: 'volume',
        asset: 'TSLA',
        condition: 'Volume spike above 200%',
        status: 'paused',
        createdAt: '2024-01-13T12:00:00Z'
      }
    ]
    
    setAlerts(mockAlerts)
    setLoading(false)
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'sentiment': return TrendingUp
      case 'price': return DollarSign
      case 'volume': return Volume2
      case 'news': return Newspaper
      default: return Bell
    }
  }

  const getAlertTypeText = (type: string) => {
    switch (type) {
      case 'sentiment': return t('alerts.sentimentChange')
      case 'price': return t('alerts.priceChange')
      case 'volume': return t('alerts.volumeSpike')
      case 'news': return t('alerts.newsAlert')
      default: return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'paused': return 'text-yellow-400'
      case 'triggered': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return t('alerts.active')
      case 'paused': return t('alerts.paused')
      case 'triggered': return t('alerts.triggered')
      default: return status
    }
  }

  const handleToggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: alert.status === 'active' ? 'paused' : 'active' }
        : alert
    ))
    toast.success(t('success.updated'))
  }

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    toast.success(t('success.deleted'))
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">{t('alerts.title')}</h1>
          <p className="text-gray-400 mb-6">{t('auth.signInToView')}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('alerts.title')}</h1>
          <p className="text-xl text-gray-400">{t('alerts.subtitle')}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t('alerts.createAlert')}</span>
        </motion.button>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">{t('alerts.noAlerts')}</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">{t('alerts.setupFirst')}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {t('alerts.createAlert')}
          </motion.button>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, index) => {
            const IconComponent = getAlertIcon(alert.type)
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 rounded-xl border border-gray-800 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <IconComponent className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{alert.asset}</h3>
                        <span className={`text-sm font-medium ${getStatusColor(alert.status)}`}>
                          {getStatusText(alert.status)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-1">
                        {getAlertTypeText(alert.type)}
                      </p>
                      <p className="text-gray-300">{alert.condition}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {t('common.created')}: {new Date(alert.createdAt).toLocaleDateString()}
                        {alert.lastTriggered && (
                          <span className="ml-4">
                            {t('alerts.lastTriggered')}: {new Date(alert.lastTriggered).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleAlert(alert.id)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title={alert.status === 'active' ? t('alerts.pause') : t('alerts.resume')}
                    >
                      {alert.status === 'active' ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title={t('alerts.edit')}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title={t('alerts.delete')}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
