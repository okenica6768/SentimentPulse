
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Clock, Globe, MessageSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { lumi } from '../lib/lumi'

export default function Analysis() {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [sentimentData, setSentimentData] = useState<any>(null)

  useEffect(() => {
    if (symbol) {
      fetchSentimentData()
    } else {
      setLoading(false)
    }
  }, [symbol])

  const fetchSentimentData = async () => {
    try {
      const { list } = await lumi.entities.sentimentData.list()
      const data = list.find((item: any) => item.symbol === symbol)
      setSentimentData(data)
    } catch (error) {
      console.error('Failed to fetch sentiment data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">{t('analysis.title')}</h1>
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

  if (!symbol) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">{t('analysis.title')}</h1>
          <p className="text-gray-400 mb-6">{t('analysis.subtitle')}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {t('common.back')} {t('nav.dashboard')}
          </button>
        </div>
      </div>
    )
  }

  const mockData = {
    symbol: symbol?.toUpperCase(),
    name: `${symbol?.toUpperCase()} Analysis`,
    sentiment: 'bullish',
    confidence: 78,
    prediction: 'growth',
    sentiment24h: 0.65,
    sentiment7d: 0.72,
    sentiment30d: 0.58,
    sources: {
      socialMedia: 0.68,
      news: 0.75,
      technical: 0.82
    },
    recentNews: [
      { title: 'Positive earnings report released', sentiment: 'positive', time: '2h ago' },
      { title: 'Market analysts upgrade rating', sentiment: 'positive', time: '4h ago' },
      { title: 'Strong quarterly performance', sentiment: 'positive', time: '6h ago' }
    ]
  }

  const data = sentimentData || mockData

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400'
      case 'bearish': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return t('analysis.bullish')
      case 'bearish': return t('analysis.bearish')
      default: return t('analysis.neutral')
    }
  }

  const getSentimentValueText = (value: number) => {
    if (value >= 0.8) return t('analysis.veryPositive')
    if (value >= 0.6) return t('analysis.positive')
    if (value >= 0.4) return t('analysis.neutral')
    if (value >= 0.2) return t('analysis.negative')
    return t('analysis.veryNegative')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {data.name} {t('analysis.title')}
          </h1>
          <p className="text-xl text-gray-400">{t('analysis.subtitle')}</p>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">{t('analysis.overview')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                {data.sentiment === 'bullish' ? (
                  <TrendingUp className="w-8 h-8 text-green-500" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-500" />
                )}
              </div>
              <p className="text-gray-400 text-sm mb-1">{t('asset.sentiment')}</p>
              <p className={`text-xl font-bold ${getSentimentColor(data.sentiment)}`}>
                {getSentimentText(data.sentiment)}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-gray-400 text-sm mb-1">{t('asset.confidence')}</p>
              <p className="text-xl font-bold text-white">{data.confidence}%</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-gray-400 text-sm mb-1">{t('asset.prediction')}</p>
              <p className="text-xl font-bold text-white capitalize">
                {data.prediction === 'growth' ? t('asset.growth') : 
                 data.prediction === 'drop' ? t('asset.drop') : t('analysis.neutral')}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">{t('analysis.timeline')}</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">{t('analysis.sentiment24h')}</span>
              <span className="text-white font-medium">
                {getSentimentValueText(data.sentiment24h)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">{t('analysis.sentiment7d')}</span>
              <span className="text-white font-medium">
                {getSentimentValueText(data.sentiment7d)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">{t('analysis.sentiment30d')}</span>
              <span className="text-white font-medium">
                {getSentimentValueText(data.sentiment30d)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Data Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">{t('analysis.sources')}</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <span className="text-gray-300">{t('analysis.socialMedia')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${data.sources.socialMedia * 100}%` }}
                  ></div>
                </div>
                <span className="text-white text-sm w-12">
                  {Math.round(data.sources.socialMedia * 100)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-green-500" />
                <span className="text-gray-300">{t('analysis.news')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${data.sources.news * 100}%` }}
                  ></div>
                </div>
                <span className="text-white text-sm w-12">
                  {Math.round(data.sources.news * 100)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <span className="text-gray-300">{t('analysis.technicalIndicators')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${data.sources.technical * 100}%` }}
                  ></div>
                </div>
                <span className="text-white text-sm w-12">
                  {Math.round(data.sources.technical * 100)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">{t('dashboard.recentAlerts')}</h3>
          
          <div className="space-y-4">
            {data.recentNews.map((news: any, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  news.sentiment === 'positive' ? 'bg-green-500' : 
                  news.sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-gray-300 text-sm">{news.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-500 text-xs">{news.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
