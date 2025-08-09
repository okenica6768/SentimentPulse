
import React from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Globe, Palette, Bell, User, Shield, HelpCircle, Sun, Moon, RefreshCw, Clock, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../hooks/useTheme'
import { useDataRefresh } from '../hooks/useDataRefresh'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, isAuthenticated } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const { autoRefresh, refreshInterval, toggleAutoRefresh, setRefreshInterval } = useDataRefresh()

  const handleRefreshIntervalChange = (minutes: number) => {
    setRefreshInterval(minutes)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white dark:text-white light:text-gray-900 mb-2">
            {t('settings.title')}
          </h1>
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-6">
            {t('auth.signInToView')}
          </p>
        </div>
      </div>
    )
  }

  const settingSections = [
    {
      title: t('settings.appearance'),
      icon: Palette,
      settings: [
        {
          label: t('settings.theme'),
          description: t('settings.themeDesc'),
          type: 'toggle',
          value: theme,
          options: [
            { value: 'light', label: t('settings.lightMode'), icon: Sun },
            { value: 'dark', label: t('settings.darkMode'), icon: Moon }
          ],
          onChange: toggleTheme
        },
        {
          label: t('settings.language'),
          description: t('settings.languageDesc'),
          type: 'select',
          value: language,
          options: [
            { value: 'en', label: t('settings.english') },
            { value: 'sk', label: t('settings.slovak') }
          ],
          onChange: setLanguage
        }
      ]
    },
    {
      title: 'Data & Refresh',
      icon: RefreshCw,
      settings: [
        {
          label: 'Auto-refresh',
          description: 'Automatically update market data in real-time',
          type: 'switch',
          value: autoRefresh,
          onChange: toggleAutoRefresh
        },
        {
          label: 'Refresh Interval',
          description: 'How often to update market data (in minutes)',
          type: 'select',
          value: refreshInterval,
          options: [
            { value: 1, label: '1 minute (Real-time)' },
            { value: 2, label: '2 minutes (Fast)' },
            { value: 5, label: '5 minutes (Standard)' },
            { value: 10, label: '10 minutes (Slow)' },
            { value: 30, label: '30 minutes (Very slow)' }
          ],
          onChange: handleRefreshIntervalChange,
          disabled: !autoRefresh
        }
      ]
    },
    {
      title: t('settings.notifications'),
      icon: Bell,
      settings: [
        {
          label: t('settings.emailNotifications'),
          description: t('settings.notificationsDesc'),
          type: 'switch',
          value: true,
          onChange: () => toast.info('Email notifications feature coming soon')
        },
        {
          label: t('settings.pushNotifications'),
          description: 'Receive push notifications for important alerts',
          type: 'switch',
          value: false,
          onChange: () => toast.info('Push notifications feature coming soon')
        },
        {
          label: 'Price Alert Threshold',
          description: 'Minimum price change % to trigger alerts',
          type: 'select',
          value: 5,
          options: [
            { value: 1, label: '1% (Very sensitive)' },
            { value: 2, label: '2% (Sensitive)' },
            { value: 5, label: '5% (Standard)' },
            { value: 10, label: '10% (Less sensitive)' }
          ],
          onChange: () => toast.info('Alert thresholds feature coming soon')
        }
      ]
    },
    {
      title: t('settings.account'),
      icon: User,
      settings: [
        {
          label: 'Email',
          description: t('settings.accountDesc'),
          type: 'display',
          value: user?.email || 'Not available'
        },
        {
          label: 'User ID',
          description: 'Your unique user identifier',
          type: 'display',
          value: user?.userId || 'Not available'
        }
      ]
    }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white dark:text-white light:text-gray-900 mb-2">
          {t('settings.title')}
        </h1>
        <p className="text-xl text-gray-400 dark:text-gray-400 light:text-gray-600">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-lg border border-gray-800 dark:border-gray-800 light:border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-1">
            <RefreshCw className={`w-4 h-4 text-blue-400 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">Auto-refresh</span>
          </div>
          <p className={`text-lg font-bold ${autoRefresh ? 'text-emerald-400' : 'text-gray-500'}`}>
            {autoRefresh ? 'Enabled' : 'Disabled'}
          </p>
        </div>

        <div className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-lg border border-gray-800 dark:border-gray-800 light:border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">Interval</span>
          </div>
          <p className="text-lg font-bold text-white dark:text-white light:text-gray-900">
            {refreshInterval}m
          </p>
        </div>

        <div className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-lg border border-gray-800 dark:border-gray-800 light:border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">Performance</span>
          </div>
          <p className={`text-lg font-bold ${
            refreshInterval <= 2 ? 'text-emerald-400' :
            refreshInterval <= 5 ? 'text-amber-400' : 'text-gray-400'
          }`}>
            {refreshInterval <= 2 ? 'Real-time' :
             refreshInterval <= 5 ? 'Fast' : 'Standard'}
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {settingSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <section.icon className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white dark:text-white light:text-gray-900">
                {section.title}
              </h2>
            </div>

            <div className="space-y-6">
              {section.settings.map((setting, settingIndex) => (
                <div key={settingIndex} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white dark:text-white light:text-gray-900 font-medium">
                      {setting.label}
                    </h3>
                    <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
                      {setting.description}
                    </p>
                  </div>

                  <div className="ml-4">
                    {setting.type === 'toggle' && (
                      <div className="flex items-center space-x-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-100 rounded-lg p-1">
                        {setting.options?.map((option) => {
                          const IconComponent = option.icon
                          return (
                            <button
                              key={option.value}
                              onClick={setting.onChange}
                              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                setting.value === option.value
                                  ? 'bg-blue-500 text-white'
                                  : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900'
                              }`}
                            >
                              {IconComponent && <IconComponent className="w-4 h-4" />}
                              <span>{option.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {setting.type === 'select' && (
                      <select
                        value={setting.value}
                        onChange={(e) => setting.onChange(
                          setting.label === 'Refresh Interval' ? 
                          parseInt(e.target.value) : e.target.value
                        )}
                        disabled={setting.disabled}
                        className={`bg-gray-800 dark:bg-gray-800 light:bg-gray-100 border border-gray-700 dark:border-gray-700 light:border-gray-300 rounded-lg px-3 py-2 text-white dark:text-white light:text-gray-900 focus:outline-none focus:border-blue-500 ${
                          setting.disabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {setting.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {setting.type === 'switch' && (
                      <button
                        onClick={setting.onChange}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          setting.value ? 'bg-blue-500' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            setting.value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    )}

                    {setting.type === 'display' && (
                      <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 font-mono text-sm">
                        {setting.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Additional Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
                {t('settings.privacy')}
              </h3>
            </div>
            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm mb-4">
              {t('settings.privacyDesc')}
            </p>
            <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
              {t('settings.viewPrivacyPolicy')}
            </button>
          </div>

          <div className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <HelpCircle className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
                {t('settings.support')}
              </h3>
            </div>
            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm mb-4">
              {t('settings.supportDesc')}
            </p>
            <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
              {t('settings.contactSupport')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
