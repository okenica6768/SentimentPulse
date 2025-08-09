
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit, 
  TrendingUp, 
  TrendingDown, 
  Volume2, 
  Brain,
  CheckCircle,
  AlertTriangle,
  Settings,
  Target
} from 'lucide-react'
import { useAlerts } from '../hooks/useAlerts'
import { useLanguage } from '../context/LanguageContext'
import { Asset, Alert } from '../types/Asset'
import toast from 'react-hot-toast'

interface AlertManagerProps {
  assets: Asset[]
  onClose?: () => void
}

export default function AlertManager({ assets, onClose }: AlertManagerProps) {
  const { t } = useLanguage()
  const { 
    alerts, 
    loading, 
    createAlert, 
    deleteAlert, 
    updateAlert,
    getAlertStats,
    getAlertTemplates,
    deleteTriggeredAlerts
  } = useAlerts()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [alertType, setAlertType] = useState<'price_up' | 'price_down' | 'sentiment_change' | 'volume_spike'>('price_up')
  const [threshold, setThreshold] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'active' | 'triggered'>('all')

  const stats = getAlertStats()

  const alertTypes = [
    { value: 'price_up', label: 'Price Up', icon: TrendingUp, color: 'text-emerald-400' },
    { value: 'price_down', label: 'Price Down', icon: TrendingDown, color: 'text-red-400' },
    { value: 'sentiment_change', label: 'Sentiment Change', icon: Brain, color: 'text-purple-400' },
    { value: 'volume_spike', label: 'Volume Spike', icon: Volume2, color: 'text-blue-400' }
  ]

  const filteredAlerts = alerts.filter(alert => {
    switch (filterType) {
      case 'active': return !alert.triggered
      case 'triggered': return alert.triggered
      default: return true
    }
  })

  const handleCreateAlert = async () => {
    if (!selectedAsset || !threshold) {
      toast.error('Please select an asset and set a threshold')
      return
    }

    const success = await createAlert({
      assetSymbol: selectedAsset.symbol,
      type: alertType,
      threshold: parseFloat(threshold),
      enabled: true
    })

    if (success) {
      setShowCreateForm(false)
      setSelectedAsset(null)
      setThreshold('')
    }
  }

  const handleQuickAlert = async (asset: Asset, type: string) => {
    const templates = getAlertTemplates(asset)
    const template = templates.find(t => t.type === type)
    
    if (template) {
      await createAlert(template)
    }
  }

  const getAlertIcon = (type: string) => {
    const alertType = alertTypes.find(t => t.value === type)
    return alertType ? alertType.icon : Bell
  }

  const getAlertColor = (type: string) => {
    const alertType = alertTypes.find(t => t.value === type)
    return alertType ? alertType.color : 'text-gray-400'
  }

  const formatThreshold = (alert: Alert) => {
    switch (alert.type) {
      case 'price_up':
      case 'price_down':
        return `$${alert.threshold.toLocaleString()}`
      case 'sentiment_change':
        return `${alert.threshold}%`
      case 'volume_spike':
        return alert.threshold >= 1e9 ? `${(alert.threshold / 1e9).toFixed(1)}B` :
               alert.threshold >= 1e6 ? `${(alert.threshold / 1e6).toFixed(1)}M` :
               alert.threshold.toLocaleString()
      default:
        return alert.threshold.toString()
    }
  }

  const formatCurrentValue = (alert: Alert) => {
    switch (alert.type) {
      case 'price_up':
      case 'price_down':
        return `$${alert.currentValue.toLocaleString()}`
      case 'sentiment_change':
        return `${alert.currentValue.toFixed(1)}%`
      case 'volume_spike':
        return alert.currentValue >= 1e9 ? `${(alert.currentValue / 1e9).toFixed(1)}B` :
               alert.currentValue >= 1e6 ? `${(alert.currentValue / 1e6).toFixed(1)}M` :
               alert.currentValue.toLocaleString()
      default:
        return alert.currentValue.toString()
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Bell className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white dark:text-white light:text-gray-900">
              Alert Manager
            </h1>
            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
              Monitor your assets with custom alerts
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Alert</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">Total Alerts</span>
          </div>
          <p className="text-3xl font-bold text-white dark:text-white light:text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">Active</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{stats.active}</p>
        </div>

        <div className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircle className="w-5 h-5 text-amber-400" />
            <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">Triggered</span>
          </div>
          <p className="text-3xl font-bold text-amber-400">{stats.triggered}</p>
          {stats.triggered > 0 && (
            <button
              onClick={deleteTriggeredAlerts}
              className="text-xs text-red-400 hover:text-red-300 mt-1"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">Most Used</span>
          </div>
          <p className="text-lg font-bold text-white dark:text-white light:text-gray-900">
            {Object.entries(stats.byType).sort(([,a], [,b]) => b - a)[0]?.[0]?.replace('_', ' ') || 'None'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-4">
          Quick Alerts for Tracked Assets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.slice(0, 6).map((asset) => (
            <div key={asset.symbol} className="bg-gray-800 dark:bg-gray-800 light:bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white dark:text-white light:text-gray-900">{asset.symbol}</h4>
                  <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                    ${asset.currentPrice.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickAlert(asset, 'price_up')}
                  className="flex items-center justify-center space-x-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs hover:bg-emerald-500/30 transition-colors"
                >
                  <TrendingUp className="w-3 h-3" />
                  <span>+5%</span>
                </button>
                <button
                  onClick={() => handleQuickAlert(asset, 'price_down')}
                  className="flex items-center justify-center space-x-1 bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs hover:bg-red-500/30 transition-colors"
                >
                  <TrendingDown className="w-3 h-3" />
                  <span>-5%</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-4 mb-6">
        {[
          { value: 'all', label: 'All Alerts' },
          { value: 'active', label: 'Active' },
          { value: 'triggered', label: 'Triggered' }
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setFilterType(filter.value as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === filter.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 dark:bg-gray-800 light:bg-gray-200 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-300'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white dark:text-white light:text-gray-900 mb-2">
              No alerts found
            </h3>
            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-6">
              Create your first alert to start monitoring assets
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Create Alert
            </button>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const IconComponent = getAlertIcon(alert.type)
            const colorClass = getAlertColor(alert.type)
            
            return (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border p-6 ${
                  alert.triggered 
                    ? 'border-amber-500 bg-amber-500/5' 
                    : 'border-gray-800 dark:border-gray-800 light:border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      alert.triggered ? 'bg-amber-500/20' : 'bg-gray-800 dark:bg-gray-800 light:bg-gray-100'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${colorClass}`} />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
                          {alert.assetSymbol}
                        </h3>
                        {alert.triggered && (
                          <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs font-medium">
                            Triggered
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Threshold: {formatThreshold(alert)}</span>
                        <span>Current: {formatCurrentValue(alert)}</span>
                        <span>Created: {new Date(alert.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {alert.triggered ? (
                      <CheckCircle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-emerald-400" />
                    )}
                    <button
                      onClick={() => deleteAlert(alert._id!)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Create Alert Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white dark:text-white light:text-gray-900 mb-6">
                Create New Alert
              </h3>
              
              <div className="space-y-4">
                {/* Asset Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                    Asset
                  </label>
                  <select
                    value={selectedAsset?.symbol || ''}
                    onChange={(e) => {
                      const asset = assets.find(a => a.symbol === e.target.value)
                      setSelectedAsset(asset || null)
                    }}
                    className="w-full px-3 py-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-100 border border-gray-700 dark:border-gray-700 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select an asset</option>
                    {assets.map((asset) => (
                      <option key={asset.symbol} value={asset.symbol}>
                        {asset.symbol} - {asset.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Alert Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                    Alert Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {alertTypes.map((type) => {
                      const IconComponent = type.icon
                      return (
                        <button
                          key={type.value}
                          onClick={() => setAlertType(type.value as any)}
                          className={`flex items-center space-x-2 p-3 rounded-lg text-sm font-medium transition-colors ${
                            alertType === type.value
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-800 dark:bg-gray-800 light:bg-gray-100 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-200'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span>{type.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Threshold */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                    Threshold
                  </label>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    placeholder={
                      alertType === 'price_up' || alertType === 'price_down' ? 'Price in USD' :
                      alertType === 'sentiment_change' ? 'Percentage change' :
                      'Volume threshold'
                    }
                    className="w-full px-3 py-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-100 border border-gray-700 dark:border-gray-700 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={handleCreateAlert}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                >
                  Create Alert
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
