
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Globe, MessageSquare, TrendingUp, TrendingDown, BarChart3, Clock, DollarSign, Volume2, Brain, AlertTriangle, Target, Zap } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import AssetChart from './AssetChart'

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
    bollinger?: {
      upper: number
      middle: number
      lower: number
    }
  }
  socialMetrics?: {
    twitterMentions: number
    redditPosts: number
    socialSentiment: number
  }
  lastAnalyzed?: string
}

interface AssetDetailModalProps {
  asset: Asset | null
  onClose: () => void
}

export default function AssetDetailModal({ asset, onClose }: AssetDetailModalProps) {
  const { t } = useLanguage()

  if (!asset) return null

  // 🎯 STANDARDIZED FORMATTING FUNCTIONS
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

  // 🎯 CONFIDENCE LEVEL - WHOLE NUMBERS ONLY
  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence)}%`
  }

  // 🎯 PERCENTAGE FORMATTING - WHOLE NUMBERS
  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`
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

  // AI Reasoning Generation
  const generateAIReasoning = () => {
    const reasons = []
    
    // Price movement analysis
    if (asset.priceChange24h > 5) {
      reasons.push({
        type: 'bullish',
        factor: t('analysis.priceMovement'),
        description: t('analysis.strongUpwardMomentum'),
        impact: 'high'
      })
    } else if (asset.priceChange24h < -5) {
      reasons.push({
        type: 'bearish',
        factor: t('analysis.priceMovement'),
        description: t('analysis.significantDecline'),
        impact: 'high'
      })
    }

    // Sentiment analysis
    if (asset.sentimentScore > 0.6) {
      reasons.push({
        type: 'bullish',
        factor: t('analysis.marketSentiment'),
        description: t('analysis.overwhelminglyPositive'),
        impact: 'medium'
      })
    } else if (asset.sentimentScore < -0.6) {
      reasons.push({
        type: 'bearish',
        factor: t('analysis.marketSentiment'),
        description: t('analysis.negativeMarketSentiment'),
        impact: 'medium'
      })
    }

    // Technical indicators
    if (asset.technicalIndicators?.rsi) {
      if (asset.technicalIndicators.rsi > 70) {
        reasons.push({
          type: 'bearish',
          factor: t('analysis.technicalIndicators'),
          description: t('analysis.overboughtCondition'),
          impact: 'medium'
        })
      } else if (asset.technicalIndicators.rsi < 30) {
        reasons.push({
          type: 'bullish',
          factor: t('analysis.technicalIndicators'),
          description: t('analysis.oversoldCondition'),
          impact: 'medium'
        })
      }
    }

    // Volume analysis
    if (asset.volume24h && asset.volume24h > 1e9) {
      reasons.push({
        type: 'bullish',
        factor: t('analysis.tradingVolume'),
        description: t('analysis.highTradingActivity'),
        impact: 'low'
      })
    }

    // Social metrics
    if (asset.socialMetrics?.socialSentiment && asset.socialMetrics.socialSentiment > 0.7) {
      reasons.push({
        type: 'bullish',
        factor: t('analysis.socialSentiment'),
        description: t('analysis.positiveSocialBuzz'),
        impact: 'low'
      })
    }

    return reasons
  }

  const aiReasons = generateAIReasoning()
  const bullishReasons = aiReasons.filter(r => r.type === 'bullish')
  const bearishReasons = aiReasons.filter(r => r.type === 'bearish')

  const getRiskLevel = () => {
    const score = asset.sentimentScore
    const confidence = asset.confidenceLevel
    
    if (confidence < 60) return { level: t('analysis.high'), color: 'text-red-400' }
    if (score > 0.5 && confidence > 80) return { level: t('analysis.low'), color: 'text-green-400' }
    if (score < -0.5) return { level: t('analysis.high'), color: 'text-red-400' }
    return { level: t('analysis.medium'), color: 'text-yellow-400' }
  }

  const risk = getRiskLevel()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 w-full max-w-7xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800 dark:border-gray-800 light:border-gray-200">
            <div className="flex items-center space-x-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-900">
                    {asset.symbol}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    asset.type === 'stock' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {asset.type.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${risk.color} bg-opacity-20`}>
                    {t('analysis.risk')}: {risk.level}
                  </span>
                </div>
                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">{asset.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Chart and Analysis */}
              <div className="lg:col-span-2 space-y-6">
                {/* Asset Chart */}
                <AssetChart asset={asset} />

                {/* 🎯 STANDARDIZED MARKET DATA SECTION */}
                <div className="bg-gray-800 dark:bg-gray-800 light:bg-gray-100 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-4 flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span>Market Data</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Current Price */}
                    <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
                          Current Price
                        </span>
                      </div>
                      <p className="text-xl font-bold text-white dark:text-white light:text-gray-900">
                        {formatPrice(asset.currentPrice)}
                      </p>
                      <p className={`text-sm font-medium ${
                        asset.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h.toFixed(2)}% (24h)
                      </p>
                    </div>

                    {/* Volume */}
                    {asset.volume24h && (
                      <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Volume2 className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
                            24h Volume
                          </span>
                        </div>
                        <p className="text-xl font-bold text-white dark:text-white light:text-gray-900">
                          {formatVolume(asset.volume24h)}
                        </p>
                        <p className="text-xs text-gray-500">Trading Activity</p>
                      </div>
                    )}

                    {/* Market Cap */}
                    {asset.marketCap && (
                      <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <BarChart3 className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
                            Market Cap
                          </span>
                        </div>
                        <p className="text-xl font-bold text-white dark:text-white light:text-gray-900">
                          {formatMarketCap(asset.marketCap)}
                        </p>
                        <p className="text-xs text-gray-500">Total Value</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 🎯 STANDARDIZED SENTIMENT ANALYSIS SECTION */}
                <div className="bg-gray-800 dark:bg-gray-800 light:bg-gray-100 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-4 flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span>Sentiment Analysis</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Sentiment Score */}
                    <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        {asset.sentimentScore > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
                          Sentiment Score
                        </span>
                      </div>
                      <p className={`text-xl font-bold ${
                        asset.sentimentScore > 0.3 ? 'text-green-400' :
                        asset.sentimentScore < -0.3 ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {formatPercentage((asset.sentimentScore + 1) * 50)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {asset.sentimentScore > 0.3 ? 'Positive' :
                         asset.sentimentScore < -0.3 ? 'Negative' : 'Neutral'}
                      </p>
                    </div>

                    {/* Growth Probability */}
                    <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
                          Growth Probability
                        </span>
                      </div>
                      <p className="text-xl font-bold text-green-400">
                        {formatPercentage(asset.predictionGrowthProb)}
                      </p>
                      <p className="text-xs text-gray-500">Next 7 Days</p>
                    </div>

                    {/* Confidence Level - WHOLE NUMBERS ONLY */}
                    <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
                          Confidence Level
                        </span>
                      </div>
                      <p className={`text-xl font-bold ${
                        asset.confidenceLevel >= 80 ? 'text-green-400' :
                        asset.confidenceLevel >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {formatConfidence(asset.confidenceLevel)}
                      </p>
                      <p className="text-xs text-gray-500">Model Accuracy</p>
                    </div>
                  </div>
                </div>

                {/* AI Analysis Reasoning */}
                <div className="bg-gray-800 dark:bg-gray-800 light:bg-gray-100 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Brain className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
                      {t('analysis.aiReasoning')}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bullish Factors */}
                    <div>
                      <h4 className="text-green-400 font-medium mb-3 flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>{t('analysis.bullishFactors')}</span>
                      </h4>
                      {bullishReasons.length > 0 ? (
                        <div className="space-y-3">
                          {bullishReasons.map((reason, index) => (
                            <div key={index} className="border-l-4 border-green-500 pl-3">
                              <p className="text-white dark:text-white light:text-gray-900 text-sm font-medium">
                                {reason.factor}
                              </p>
                              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs">
                                {reason.description}
                              </p>
                              <span className={`text-xs px-2 py-1 rounded ${
                                reason.impact === 'high' ? 'bg-green-500/20 text-green-400' :
                                reason.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {t(`analysis.${reason.impact}Impact`)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">{t('analysis.noBullishFactors')}</p>
                      )}
                    </div>

                    {/* Bearish Factors */}
                    <div>
                      <h4 className="text-red-400 font-medium mb-3 flex items-center space-x-2">
                        <TrendingDown className="w-4 h-4" />
                        <span>{t('analysis.bearishFactors')}</span>
                      </h4>
                      {bearishReasons.length > 0 ? (
                        <div className="space-y-3">
                          {bearishReasons.map((reason, index) => (
                            <div key={index} className="border-l-4 border-red-500 pl-3">
                              <p className="text-white dark:text-white light:text-gray-900 text-sm font-medium">
                                {reason.factor}
                              </p>
                              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs">
                                {reason.description}
                              </p>
                              <span className={`text-xs px-2 py-1 rounded ${
                                reason.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                                reason.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {t(`analysis.${reason.impact}Impact`)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">{t('analysis.noBearishFactors')}</p>
                      )}
                    </div>
                  </div>

                  {/* Overall Assessment */}
                  <div className="mt-6 p-4 bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg">
                    <h4 className="text-white dark:text-white light:text-gray-900 font-medium mb-2 flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>{t('analysis.overallAssessment')}</span>
                    </h4>
                    <p className="text-gray-300 dark:text-gray-300 light:text-gray-700 text-sm">
                      {asset.sentimentScore > 0.3 
                        ? t('analysis.positiveOutlook')
                        : asset.sentimentScore < -0.3 
                        ? t('analysis.negativeOutlook')
                        : t('analysis.neutralOutlook')
                      } {t('analysis.confidenceLevel')}: {formatConfidence(asset.confidenceLevel)}
                    </p>
                  </div>
                </div>

                {/* 🎯 STANDARDIZED TECHNICAL ANALYSIS SECTION */}
                {asset.technicalIndicators && (
                  <div className="bg-gray-800 dark:bg-gray-800 light:bg-gray-100 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-4 flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      <span>{t('analysis.technicalAnalysis')}</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg p-4 text-center">
                        <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm mb-1">RSI</p>
                        <p className={`text-lg font-bold ${
                          asset.technicalIndicators.rsi > 70 ? 'text-red-400' :
                          asset.technicalIndicators.rsi < 30 ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {asset.technicalIndicators.rsi?.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {asset.technicalIndicators.rsi > 70 ? t('analysis.overbought') :
                           asset.technicalIndicators.rsi < 30 ? t('analysis.oversold') : t('analysis.neutral')}
                        </p>
                      </div>
                      <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg p-4 text-center">
                        <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm mb-1">MACD</p>
                        <p className={`text-lg font-bold ${
                          asset.technicalIndicators.macd > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {asset.technicalIndicators.macd?.toFixed(3)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {asset.technicalIndicators.macd > 0 ? t('analysis.bullish') : t('analysis.bearish')}
                        </p>
                      </div>
                      <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg p-4 text-center">
                        <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm mb-1">SMA 20</p>
                        <p className="text-lg font-bold text-blue-400">
                          {formatPrice(asset.technicalIndicators.sma20)}
                        </p>
                        <p className="text-xs text-gray-500">{t('analysis.shortTerm')}</p>
                      </div>
                      <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg p-4 text-center">
                        <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm mb-1">SMA 50</p>
                        <p className="text-lg font-bold text-purple-400">
                          {formatPrice(asset.technicalIndicators.sma50)}
                        </p>
                        <p className="text-xs text-gray-500">{t('analysis.longTerm')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🎯 STANDARDIZED PREDICTION ANALYSIS SECTION */}
                <div className="bg-gray-800 dark:bg-gray-800 light:bg-gray-100 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-4 flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span>{t('analysis.predictionAnalysis')}</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      </div>
                      <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm mb-1">
                        {t('analysis.growthProbability')}
                      </p>
                      <p className="text-2xl font-bold text-green-400">
                        {formatPercentage(asset.predictionGrowthProb)}
                      </p>
                      <p className="text-xs text-gray-500">{t('analysis.nextWeek')}</p>
                    </div>
                    <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <BarChart3 className="w-6 h-6 text-blue-400" />
                      </div>
                      <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm mb-1">
                        {t('analysis.confidenceLevel')}
                      </p>
                      <p className="text-2xl font-bold text-blue-400">
                        {formatConfidence(asset.confidenceLevel)}
                      </p>
                      <p className="text-xs text-gray-500">{t('analysis.modelAccuracy')}</p>
                    </div>
                    <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <AlertTriangle className="w-6 h-6 text-yellow-400" />
                      </div>
                      <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm mb-1">
                        {t('analysis.riskLevel')}
                      </p>
                      <p className={`text-2xl font-bold ${risk.color}`}>
                        {risk.level}
                      </p>
                      <p className="text-xs text-gray-500">{t('analysis.investmentRisk')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - News and Social */}
              <div className="space-y-6">
                {/* News Articles */}
                {asset.newsArticles && asset.newsArticles.length > 0 && (
                  <div className="bg-gray-800 dark:bg-gray-800 light:bg-gray-100 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Globe className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
                        {t('analysis.latestNews')}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {asset.newsArticles.map((article, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white dark:text-white light:text-gray-900 font-medium text-sm mb-1 line-clamp-2">
                                {article.title}
                              </h4>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>{article.source}</span>
                                <span>•</span>
                                <span>{getTimeAgo(article.publishedAt)}</span>
                                <span>•</span>
                                <span className={`px-2 py-1 rounded ${
                                  article.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                                  article.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {t(`analysis.${article.sentiment}`)}
                                </span>
                              </div>
                            </div>
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 p-1 text-gray-400 hover:text-blue-400 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 🎯 STANDARDIZED SOCIAL METRICS SECTION */}
                {asset.socialMetrics && (
                  <div className="bg-gray-800 dark:bg-gray-800 light:bg-gray-100 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
                        {t('analysis.socialSentiment')}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">{t('analysis.twitterMentions')}</span>
                          <span className="text-white dark:text-white light:text-gray-900 font-medium">
                            {asset.socialMetrics.twitterMentions.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">{t('analysis.redditPosts')}</span>
                          <span className="text-white dark:text-white light:text-gray-900 font-medium">
                            {asset.socialMetrics.redditPosts.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-700 dark:bg-gray-700 light:bg-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">{t('analysis.socialScore')}</span>
                          <span className={`font-medium ${
                            asset.socialMetrics.socialSentiment > 0.6 ? 'text-green-400' :
                            asset.socialMetrics.socialSentiment < 0.4 ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {formatPercentage(asset.socialMetrics.socialSentiment * 100)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Last Update */}
                <div className="bg-gray-800 dark:bg-gray-800 light:bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>
                      {t('asset.lastAnalyzed')}: {asset.lastAnalyzed ? getTimeAgo(asset.lastAnalyzed) : t('time.now')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
