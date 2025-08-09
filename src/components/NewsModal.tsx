
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Globe, Clock, TrendingUp, TrendingDown, Filter, Search } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { lumi } from '../lib/lumi'

interface NewsArticle {
  title: string
  url: string
  source: string
  publishedAt: string
  sentiment: 'positive' | 'negative' | 'neutral'
  summary?: string
}

interface Asset {
  symbol: string
  name: string
  newsArticles?: NewsArticle[]
}

interface NewsModalProps {
  asset: Asset | null
  onClose: () => void
}

export default function NewsModal({ asset, onClose }: NewsModalProps) {
  const { t } = useLanguage()
  const [news, setNews] = useState<NewsArticle[]>([])
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  useEffect(() => {
    if (asset) {
      fetchNews()
    }
  }, [asset])

  useEffect(() => {
    filterNews()
  }, [news, searchTerm, sentimentFilter, sourceFilter])

  const fetchNews = async () => {
    if (!asset) return
    
    setLoading(true)
    try {
      // Generate mock news data or use existing news articles
      const mockNews: NewsArticle[] = asset.newsArticles || [
        {
          title: `${asset.symbol} Shows Strong Performance Amid Market Volatility`,
          url: `https://example.com/news/${asset.symbol.toLowerCase()}-performance`,
          source: 'Financial Times',
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sentiment: 'positive',
          summary: `${asset.name} demonstrates resilience with solid fundamentals and growing investor confidence.`
        },
        {
          title: `Market Analysis: ${asset.symbol} Technical Indicators Signal Potential Breakout`,
          url: `https://example.com/analysis/${asset.symbol.toLowerCase()}-breakout`,
          source: 'MarketWatch',
          publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          sentiment: 'positive',
          summary: 'Technical analysis suggests bullish momentum building for the asset.'
        },
        {
          title: `${asset.symbol} Faces Headwinds as Sector Concerns Mount`,
          url: `https://example.com/news/${asset.symbol.toLowerCase()}-concerns`,
          source: 'Reuters',
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          sentiment: 'negative',
          summary: 'Industry challenges may impact short-term performance despite strong fundamentals.'
        },
        {
          title: `Analyst Report: ${asset.symbol} Maintains Neutral Rating`,
          url: `https://example.com/reports/${asset.symbol.toLowerCase()}-rating`,
          source: 'Bloomberg',
          publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          sentiment: 'neutral',
          summary: 'Analysts maintain cautious optimism with balanced risk assessment.'
        },
        {
          title: `${asset.name} Announces Strategic Partnership Initiative`,
          url: `https://example.com/news/${asset.symbol.toLowerCase()}-partnership`,
          source: 'Yahoo Finance',
          publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          sentiment: 'positive',
          summary: 'New partnerships expected to drive growth and market expansion.'
        },
        {
          title: `Market Volatility Impacts ${asset.symbol} Trading Volume`,
          url: `https://example.com/market/${asset.symbol.toLowerCase()}-volume`,
          source: 'CNBC',
          publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          sentiment: 'neutral',
          summary: 'Increased trading activity reflects heightened investor interest.'
        }
      ]
      
      setNews(mockNews)
    } catch (error) {
      console.error('Failed to fetch news:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterNews = () => {
    let filtered = news

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by sentiment
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(article => article.sentiment === sentimentFilter)
    }

    // Filter by source
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(article => article.source === sourceFilter)
    }

    setFilteredNews(filtered)
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return t('time.justNow')
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-400'
      case 'negative': return 'text-red-400'
      default: return 'text-amber-400'
    }
  }

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-emerald-500/20'
      case 'negative': return 'bg-red-500/20'
      default: return 'bg-amber-500/20'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return TrendingUp
      case 'negative': return TrendingDown
      default: return Globe
    }
  }

  const uniqueSources = [...new Set(news.map(article => article.source))]

  if (!asset) return null

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
          className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 w-full max-w-4xl max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800 dark:border-gray-800 light:border-gray-200">
            <div className="flex items-center space-x-3">
              <Globe className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-900">
                {asset.symbol} News
              </h2>
              <span className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                ({filteredNews.length} articles)
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-800 dark:border-gray-800 light:border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-100 border border-gray-700 dark:border-gray-700 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Sentiment Filter */}
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value as any)}
                className="px-3 py-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-100 border border-gray-700 dark:border-gray-700 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Sentiment</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>

              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-100 border border-gray-700 dark:border-gray-700 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Sources</option>
                {uniqueSources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>

          {/* News Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                  No news articles found
                </p>
                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNews.map((article, index) => {
                  const SentimentIcon = getSentimentIcon(article.sentiment)
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-800 dark:bg-gray-800 light:bg-gray-100 rounded-lg p-6 border border-gray-700 dark:border-gray-700 light:border-gray-300 hover:border-gray-600 dark:hover:border-gray-600 light:hover:border-gray-400 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-2 line-clamp-2">
                            {article.title}
                          </h3>
                          {article.summary && (
                            <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm mb-3 line-clamp-2">
                              {article.summary}
                            </p>
                          )}
                        </div>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 p-2 text-gray-400 hover:text-blue-400 transition-colors flex-shrink-0"
                          title="Read full article"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-300 dark:text-gray-300 light:text-gray-700 font-medium">
                            {article.source}
                          </span>
                          <div className="flex items-center space-x-1 text-gray-500 text-sm">
                            <Clock className="w-3 h-3" />
                            <span>{getTimeAgo(article.publishedAt)}</span>
                          </div>
                        </div>
                        
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getSentimentBg(article.sentiment)}`}>
                          <SentimentIcon className={`w-4 h-4 ${getSentimentColor(article.sentiment)}`} />
                          <span className={`text-sm font-medium ${getSentimentColor(article.sentiment)}`}>
                            {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
