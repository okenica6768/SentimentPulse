
import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart3, Eye, X, ExternalLink, Clock, Globe, ArrowUp, ArrowDown, Activity } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

interface Asset {
  _id?: string
  symbol: string
  name: string
  type: 'stock' | 'crypto'
  currentPrice: number
  priceChange24h: number
  volume24h?: number
  marketCap?: number
  sentimentScore: number
  predictionGrowthProb: number
  confidenceLevel: number
  newsArticles?: Array<{
    title: string
    url: string
    source: string
    publishedAt: string
    sentiment: string
  }>
  technicalIndicators?: {
    rsi: number
    macd: number
    sma20: number
    sma50: number
  }
  socialMetrics?: {
    twitterMentions: number
    redditPosts: number
    socialSentiment: number
  }
  lastAnalyzed?: string
  weekHigh52?: number
  weekLow52?: number
  allTimeHigh?: number
  allTimeLow?: number
}

interface AssetCardProps {
  asset: Asset
  isTracked: boolean
  onTrack: () => void
  onUntrack: () => void
  onViewDetails: () => void
  onViewNews: () => void
  delay?: number
}

export default function AssetCard({ asset, isTracked, onTrack, onUntrack, onViewDetails, onViewNews, delay = 0 }: AssetCardProps) {
  const { t } = useLanguage()

  // 🎯 CONFIDENCE LEVEL - WHOLE NUMBERS ONLY
  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence)}%`
  }

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-emerald-400'
    if (score < -0.3) return 'text-red-400'
    return 'text-amber-400'
  }

  const getSentimentBg = (score: number) => {
    if (score > 0.3) return 'bg-emerald-500/20'
    if (score < -0.3) return 'bg-red-500/20'
    return 'bg-amber-500/20'
  }

  const getSentimentText = (score: number) => {
    if (score > 0.6) return t('analysis.veryPositive')
    if (score > 0.3) return t('analysis.positive')
    if (score > -0.3) return t('analysis.neutral')
    if (score > -0.6) return t('analysis.negative')
    return t('analysis.veryNegative')
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-emerald-400'
    if (confidence >= 60) return 'text-amber-400'
    return 'text-red-400'
  }

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 80) return 'bg-emerald-500/20'
    if (confidence >= 60) return 'bg-amber-500/20'
    return 'bg-red-500/20'
  }

  const formatPrice = (price: number) => {
    if (asset.type === 'crypto' && price < 1) {
      return `$${price.toFixed(6)}`
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`
    return `$${volume.toFixed(0)}`
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`
    return `$${marketCap.toFixed(0)}`
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return t('time.justNow')
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  const getPriceChangeColor = (change: number) => {
    return change >= 0 ? 'text-emerald-500' : 'text-red-500'
  }

  const getTrendIcon = (change: number) => {
    return change >= 0 ? ArrowUp : ArrowDown
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 hover:border-gray-700 dark:hover:border-gray-700 light:hover:border-gray-300 transition-all duration-300 overflow-hidden group"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-xl font-bold text-white dark:text-white light:text-gray-900">{asset.symbol}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                asset.type === 'stock' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-purple-500/20 text-purple-400'
              }`}>
                {asset.type.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">{asset.name}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* News Button */}
            <button
              onClick={onViewNews}
              className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
              title={t('asset.viewNews')}
            >
              <Globe className="w-4 h-4" />
            </button>
            {/* Analysis Button */}
            <button
              onClick={onViewDetails}
              className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
              title={t('asset.viewAnalysis')}
            >
              <Eye className="w-4 h-4" />
            </button>
            {/* Track/Untrack Button */}
            {isTracked ? (
              <button
                onClick={onUntrack}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                title={t('asset.untrack')}
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onTrack}
                className="p-2 text-gray-400 hover:text-emerald-400 transition-colors"
                title={t('asset.track')}
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Price Section with Enhanced Styling */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs mb-1">{t('asset.price')}</p>
            <p className="text-2xl font-bold text-white dark:text-white light:text-gray-900">{formatPrice(asset.currentPrice)}</p>
          </div>
          <div>
            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs mb-1">{t('asset.change')}</p>
            <div className="flex items-center space-x-1">
              {React.createElement(getTrendIcon(asset.priceChange24h), { 
                className: `w-4 h-4 ${getPriceChangeColor(asset.priceChange24h)}` 
              })}
              <p className={`text-lg font-bold ${getPriceChangeColor(asset.priceChange24h)}`}>
                {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Market Data */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          {asset.volume24h && (
            <div>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs mb-1">{t('asset.volume')}</p>
              <p className="text-gray-300 dark:text-gray-300 light:text-gray-700 font-medium">{formatVolume(asset.volume24h)}</p>
            </div>
          )}
          {asset.marketCap && (
            <div>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs mb-1">{t('asset.marketCap')}</p>
              <p className="text-gray-300 dark:text-gray-300 light:text-gray-700 font-medium">{formatMarketCap(asset.marketCap)}</p>
            </div>
          )}
        </div>

        {/* 52-Week High/Low or All-Time High/Low */}
        {(asset.weekHigh52 || asset.allTimeHigh) && (
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs mb-1">
                {asset.type === 'stock' ? '52W High' : 'ATH'}
              </p>
              <p className="text-emerald-400 font-medium">
                {formatPrice(asset.weekHigh52 || asset.allTimeHigh || 0)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs mb-1">
                {asset.type === 'stock' ? '52W Low' : 'ATL'}
              </p>
              <p className="text-red-400 font-medium">
                {formatPrice(asset.weekLow52 || asset.allTimeLow || 0)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Sentiment Analysis */}
      <div className="px-6 pb-4">
        <div className={`rounded-lg p-4 ${getSentimentBg(asset.sentimentScore)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 dark:text-gray-300 light:text-gray-700 text-sm font-medium">{t('asset.sentiment')}</span>
            <div className="flex items-center space-x-1">
              {asset.sentimentScore > 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm font-bold ${getSentimentColor(asset.sentimentScore)}`}>
                {getSentimentText(asset.sentimentScore)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-300 rounded-full h-2 mr-3">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    asset.sentimentScore > 0 ? 'bg-emerald-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${Math.abs(asset.sentimentScore) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Enhanced Confidence Display - WHOLE NUMBERS ONLY */}
          <div className={`flex items-center justify-between p-2 rounded ${getConfidenceBg(asset.confidenceLevel)}`}>
            <span className="text-xs font-medium text-gray-300 dark:text-gray-300 light:text-gray-700">
              {t('asset.confidence')}
            </span>
            <div className="flex items-center space-x-1">
              <Activity className={`w-3 h-3 ${getConfidenceColor(asset.confidenceLevel)}`} />
              <span className={`text-sm font-bold ${getConfidenceColor(asset.confidenceLevel)}`}>
                {formatConfidence(asset.confidenceLevel)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-800/50 dark:bg-gray-800/50 light:bg-gray-100/50 border-t border-gray-800 dark:border-gray-800 light:border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{t('asset.lastUpdate')}: {asset.lastAnalyzed ? getTimeAgo(asset.lastAnalyzed) : '1m'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <BarChart3 className="w-3 h-3" />
            <span>{Math.round(asset.predictionGrowthProb)}% {t('asset.growth')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
