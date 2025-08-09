
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, Bell, Settings, User, LogOut, Crown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, isAuthenticated, signIn, signOut } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()

  const handleSignIn = async () => {
    try {
      await signIn()
      toast.success(t('common.success'))
    } catch (error) {
      toast.error(t('common.error'))
    }
  }

  const handleSignOut = () => {
    signOut()
    toast.success(t('common.success'))
  }

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: TrendingUp },
    { path: '/alerts', label: t('nav.alerts'), icon: Bell },
    { path: '/subscription', label: t('nav.subscription'), icon: Crown },
    { path: '/settings', label: t('nav.settings'), icon: Settings }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 dark:bg-gray-900/95 light:bg-white/95 backdrop-blur-sm border-b border-gray-800 dark:border-gray-800 light:border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SentimentPulse
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-blue-400 bg-blue-500/10' 
                      : 'text-gray-300 dark:text-gray-300 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-800 light:hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.path === '/subscription' ? 'text-yellow-400' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 dark:text-gray-300 light:text-gray-700">
                    {user?.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-800 light:hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.signOut')}</span>
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignIn}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all"
              >
                {t('nav.signIn')}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
