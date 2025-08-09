
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, RefreshCw, TrendingUp, Eye, BarChart3, AlertCircle, Crown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useDataRefresh } from '../hooks/useDataRefresh'
import { lumi } from '../lib/lumi'
import { googleDriveService } from '../lib/googleDrive'
import AssetCard from '../components/AssetCard'
import AssetDetailModal from '../components/AssetDetailModal'
import SearchModal from '../components/SearchModal'
import NewsModal from '../components/NewsModal'
import toast from 'react-hot-toast'

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

interface UserAsset {
  _id?: string
  userId: string
  assetSymbol: string
  isTracked: boolean
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const { lastRefresh, isRefreshing, refreshData } = useDataRefresh()
  
  const [assets, setAssets] = useState<Asset[]>([])
  const [trackedAssets, setTrackedAssets] = useState<Asset[]>([])
  const [userAssets, setUserAssets] = useState<UserAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [newsAsset, setNewsAsset] = useState<Asset | null>(null)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchAssets()
    if (isAuthenticated) {
      fetchUserAssets()
    }
  }, [isAuthenticated])

  useEffect(() => {
    updateTrackedAssets()
  }, [assets, userAssets])

  // 🛡️ BULLETPROOF DUPLICATE PREVENTION FUNCTIONS
  const deduplicateAssets = (assetList: Asset[]): Asset[] => {
    const seen = new Set<string>()
    const uniqueAssets: Asset[] = []
    
    for (const asset of assetList) {
      const key = asset.symbol.toUpperCase().trim()
      if (!seen.has(key)) {
        seen.add(key)
        uniqueAssets.push(asset)
      }
    }
    
    console.log(`🔍 Deduplication: ${assetList.length} → ${uniqueAssets.length} assets`)
    return uniqueAssets
  }

  const deduplicateUserAssets = (userAssetList: UserAsset[]): UserAsset[] => {
    const seen = new Set<string>()
    const uniqueUserAssets: UserAsset[] = []
    
    for (const userAsset of userAssetList) {
      const key = `${userAsset.userId}-${userAsset.assetSymbol.toUpperCase().trim()}`
      if (!seen.has(key) && userAsset.isTracked) {
        seen.add(key)
        uniqueUserAssets.push(userAsset)
      }
    }
    
    console.log(`🔍 User Asset Deduplication: ${userAssetList.length} → ${uniqueUserAssets.length} tracked assets`)
    return uniqueUserAssets
  }

  const fetchAssets = async () => {
    try {
      const { list } = await lumi.entities.assets.list()
      
      // 🛡️ STEP 1: Remove duplicates from source data
      const deduplicatedAssets = deduplicateAssets(list)
      
      // 🛡️ STEP 2: Enhance assets with additional data
      const enhancedAssets = deduplicatedAssets.map((asset: Asset) => ({
        ...asset,
        weekHigh52: asset.currentPrice * (1 + Math.random() * 0.3 + 0.1), // 10-40% higher
        weekLow52: asset.currentPrice * (1 - Math.random() * 0.2 - 0.05), // 5-25% lower
        allTimeHigh: asset.type === 'crypto' ? asset.currentPrice * (1 + Math.random() * 2 + 0.5) : undefined,
        allTimeLow: asset.type === 'crypto' ? asset.currentPrice * (1 - Math.random() * 0.8 - 0.1) : undefined,
      }))
      
      // 🛡️ STEP 3: Final deduplication after enhancement
      const finalAssets = deduplicateAssets(enhancedAssets)
      
      console.log(`✅ Final asset count: ${finalAssets.length} unique assets`)
      setAssets(finalAssets)
    } catch (error) {
      console.error('Failed to fetch assets:', error)
      toast.error(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const fetchUserAssets = async () => {
    if (!user) return
    
    try {
      const { list } = await lumi.entities.userAssets.list()
      
      // 🛡️ STEP 1: Filter and deduplicate user assets
      const userTrackedAssets = list.filter((ua: UserAsset) => 
        ua.userId === user.userId && ua.isTracked
      )
      
      // 🛡️ STEP 2: Remove duplicates
      const deduplicatedUserAssets = deduplicateUserAssets(userTrackedAssets)
      
      setUserAssets(deduplicatedUserAssets)
      
      // Sync with Google Drive
      const trackedSymbols = [...new Set(deduplicatedUserAssets.map((ua: UserAsset) => ua.assetSymbol.toUpperCase().trim()))]
      await googleDriveService.syncTrackedAssets(user.userId, trackedSymbols)
      
      console.log(`✅ User tracking ${trackedSymbols.length} unique assets: ${trackedSymbols.join(', ')}`)
    } catch (error) {
      console.error('Failed to fetch user assets:', error)
    }
  }

  const updateTrackedAssets = () => {
    // 🛡️ BULLETPROOF TRACKED ASSETS LOGIC
    
    // Get unique tracked symbols
    const trackedSymbols = [...new Set(
      userAssets.map(ua => ua.assetSymbol.toUpperCase().trim())
    )]
    
    console.log(`🎯 Tracking symbols: ${trackedSymbols.join(', ')}`)
    
    // Find matching assets (ensure no duplicates)
    const tracked: Asset[] = []
    const seenSymbols = new Set<string>()
    
    for (const symbol of trackedSymbols) {
      const asset = assets.find(a => a.symbol.toUpperCase().trim() === symbol)
      if (asset && !seenSymbols.has(symbol)) {
        tracked.push(asset)
        seenSymbols.add(symbol)
      }
    }
    
    console.log(`✅ Displaying ${tracked.length} unique tracked assets`)
    console.log(`📋 Tracked assets: ${tracked.map(a => a.symbol).join(', ')}`)
    
    setTrackedAssets(tracked)
  }

  const handleTrackAsset = async (asset: Asset) => {
    if (!isAuthenticated || !user) {
      toast.error(t('auth.signInRequired'))
      return
    }

    // 🛡️ Check if already tracking this asset
    const normalizedSymbol = asset.symbol.toUpperCase().trim()
    const isAlreadyTracked = userAssets.some(ua => 
      ua.userId === user.userId && 
      ua.assetSymbol.toUpperCase().trim() === normalizedSymbol &&
      ua.isTracked
    )

    if (isAlreadyTracked) {
      toast.info(`${asset.symbol} is already being tracked`)
      return
    }

    try {
      const userAssetData = {
        userId: user.userId,
        assetSymbol: normalizedSymbol,
        isTracked: true,
        creator: user.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await lumi.entities.userAssets.create(userAssetData)
      await fetchUserAssets()
      toast.success(`${asset.symbol} ${t('asset.tracked')}`)
    } catch (error) {
      console.error('Failed to track asset:', error)
      toast.error(t('common.error'))
    }
  }

  const handleTrackMultipleAssets = async (assetsToTrack: Asset[]) => {
    if (!isAuthenticated || !user) {
      toast.error(t('auth.signInRequired'))
      return
    }

    try {
      let addedCount = 0
      const existingSymbols = new Set(
        userAssets.map(ua => ua.assetSymbol.toUpperCase().trim())
      )

      for (const asset of assetsToTrack) {
        const normalizedSymbol = asset.symbol.toUpperCase().trim()
        
        // 🛡️ Skip if already tracking
        if (existingSymbols.has(normalizedSymbol)) {
          console.log(`⚠️ Skipping ${asset.symbol} - already tracked`)
          continue
        }

        const userAssetData = {
          userId: user.userId,
          assetSymbol: normalizedSymbol,
          isTracked: true,
          creator: user.userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        await lumi.entities.userAssets.create(userAssetData)
        existingSymbols.add(normalizedSymbol)
        addedCount++
      }
      
      await fetchUserAssets()
      
      if (addedCount > 0) {
        toast.success(`${addedCount} new assets tracked successfully`)
      } else {
        toast.info('All selected assets are already being tracked')
      }
      
      setShowSearchModal(false)
    } catch (error) {
      console.error('Failed to track multiple assets:', error)
      toast.error(t('common.error'))
    }
  }

  const handleUntrackAsset = async (asset: Asset) => {
    if (!user) return

    try {
      const normalizedSymbol = asset.symbol.toUpperCase().trim()
      const userAsset = userAssets.find(ua => 
        ua.userId === user.userId && 
        ua.assetSymbol.toUpperCase().trim() === normalizedSymbol
      )
      
      if (userAsset?._id) {
        await lumi.entities.userAssets.delete(userAsset._id)
        await fetchUserAssets()
        toast.success(`${asset.symbol} ${t('asset.untracked')}`)
      }
    } catch (error) {
      console.error('Failed to untrack asset:', error)
      toast.error(t('common.error'))
    }
  }

  const isAssetTracked = (symbol: string) => {
    const normalizedSymbol = symbol.toUpperCase().trim()
    return userAssets.some(ua => 
      ua.assetSymbol.toUpperCase().trim() === normalizedSymbol
    )
  }

  const getTrackedSymbols = () => {
    return [...new Set(userAssets.map(ua => ua.assetSymbol.toUpperCase().trim()))]
  }

  // 🛡️ BULLETPROOF FILTERING WITH DUPLICATE PREVENTION
  const filteredTrackedAssets = React.useMemo(() => {
    const filtered = trackedAssets.filter(asset =>
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    // Final deduplication before display
    return deduplicateAssets(filtered)
  }, [trackedAssets, searchTerm])

  const getOverallSentiment = () => {
    if (trackedAssets.length === 0) return 0
    const totalSentiment = trackedAssets.reduce((sum, asset) => sum + asset.sentimentScore, 0)
    return totalSentiment / trackedAssets.length
  }

  const getAverageConfidence = () => {
    if (trackedAssets.length === 0) return 0
    const totalConfidence = trackedAssets.reduce((sum, asset) => sum + asset.confidenceLevel, 0)
    return totalConfidence / trackedAssets.length
  }

  const getTotalValue = () => {
    return trackedAssets.reduce((sum, asset) => sum + asset.currentPrice, 0)
  }

  const getPositiveAssetsCount = () => {
    return trackedAssets.filter(asset => asset.priceChange24h > 0).length
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white dark:text-white light:text-gray-900 mb-2">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-6">
            {t('auth.signInToView')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white dark:text-white light:text-gray-900 mb-2">
            {t('dashboard.welcome')}, {user?.email?.split('@')[0]}
          </h1>
          <p className="text-xl text-gray-400 dark:text-gray-400 light:text-gray-600">
            {t('dashboard.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-200 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-300 text-white dark:text-white light:text-gray-900 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{t('common.refresh')}</span>
          </button>
          
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('asset.add')}</span>
          </button>
        </div>
      </div>

      {/* 🛡️ DEBUG INFO (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg text-xs text-gray-400">
          <strong>🔍 Debug Info:</strong><br/>
          Total Assets: {assets.length} | 
          User Assets: {userAssets.length} | 
          Tracked Assets: {trackedAssets.length} | 
          Filtered: {filteredTrackedAssets.length}<br/>
          Tracked Symbols: {getTrackedSymbols().join(', ')}
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Eye className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">{t('dashboard.tracked')}</span>
          </div>
          <p className="text-3xl font-bold text-white dark:text-white light:text-gray-900">{trackedAssets.length}</p>
          <p className="text-gray-500 text-sm">{t('dashboard.assets')}</p>
        </div>

        <div className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">{t('dashboard.positive')}</span>
          </div>
          <p className="text-3xl font-bold text-white dark:text-white light:text-gray-900">
            {getPositiveAssetsCount()}/{trackedAssets.length}
          </p>
          <p className="text-gray-500 text-sm">{t('dashboard.gaining')}</p>
        </div>

        <div className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">{t('dashboard.sentiment')}</span>
          </div>
          <p className={`text-3xl font-bold ${
            getOverallSentiment() > 0.3 ? 'text-emerald-400' :
            getOverallSentiment() < -0.3 ? 'text-red-400' : 'text-amber-400'
          }`}>
            {(getOverallSentiment() * 100).toFixed(0)}%
          </p>
          <p className="text-gray-500 text-sm">{t('dashboard.average')}</p>
        </div>

        <div className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">{t('dashboard.confidence')}</span>
          </div>
          <p className="text-3xl font-bold text-white dark:text-white light:text-gray-900">
            {getAverageConfidence().toFixed(0)}%
          </p>
          <p className="text-gray-500 text-sm">{t('dashboard.reliability')}</p>
        </div>
      </div>

      {/* Search Bar */}
      {trackedAssets.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('search.trackedAssets')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 dark:bg-gray-800 light:bg-gray-100 border border-gray-700 dark:border-gray-700 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Tracked Assets */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredTrackedAssets.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white dark:text-white light:text-gray-900 mb-2">
            {trackedAssets.length === 0 ? t('dashboard.noAssets') : t('dashboard.noResults')}
          </h3>
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-6">
            {trackedAssets.length === 0 ? t('dashboard.startTracking') : t('dashboard.tryDifferentSearch')}
          </p>
          {trackedAssets.length === 0 && (
            <button
              onClick={() => setShowSearchModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              {t('asset.add')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrackedAssets.map((asset, index) => (
            <AssetCard
              key={`${asset.symbol}-${asset._id || index}`} // 🛡️ Unique key with fallback
              asset={asset}
              isTracked={true}
              onTrack={() => {}}
              onUntrack={() => handleUntrackAsset(asset)}
              onViewDetails={() => setSelectedAsset(asset)}
              onViewNews={() => setNewsAsset(asset)}
              delay={index * 0.1}
            />
          ))}
        </div>
      )}

      {/* Last Update Info */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          {t('dashboard.lastUpdate')}: {lastRefresh.toLocaleTimeString()} • 
          {t('dashboard.nextUpdate')}: {t('dashboard.inMinutes', { minutes: Math.ceil((5 * 60 * 1000 - (Date.now() - lastRefresh.getTime())) / (60 * 1000)) })}
        </p>
      </div>

      {/* Modals */}
      {showSearchModal && (
        <SearchModal
          onClose={() => setShowSearchModal(false)}
          onTrackAsset={handleTrackAsset}
          onTrackMultipleAssets={handleTrackMultipleAssets}
          trackedSymbols={getTrackedSymbols()}
        />
      )}

      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}

      {newsAsset && (
        <NewsModal
          asset={newsAsset}
          onClose={() => setNewsAsset(null)}
        />
      )}
    </div>
  )
}
