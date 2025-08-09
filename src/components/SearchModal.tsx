
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, TrendingUp, TrendingDown, Plus, Filter, CheckSquare, Square, Users } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { lumi } from '../lib/lumi'

interface Asset {
  _id?: string
  symbol: string
  name: string
  type: 'stock' | 'crypto'
  currentPrice: number
  priceChange24h: number
  sentimentScore: number
  predictionGrowthProb: number
  confidenceLevel: number
  volume24h?: number
  marketCap?: number
}

interface SearchModalProps {
  onClose: () => void
  onTrackAsset: (asset: Asset) => void
  onTrackMultipleAssets: (assets: Asset[]) => void
  trackedSymbols?: string[]
}

export default function SearchModal({ onClose, onTrackAsset, onTrackMultipleAssets, trackedSymbols = [] }: SearchModalProps) {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<'all' | 'stock' | 'crypto'>('all')
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)
  const [sortBy, setSortBy] = useState<'popularity' | 'price' | 'change' | 'sentiment'>('popularity')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    fetchAssets()
  }, [])

  useEffect(() => {
    filterAssets()
  }, [searchTerm, assets, selectedType, trackedSymbols, sortBy, minPrice, maxPrice])

  const fetchAssets = async () => {
    try {
      const { list } = await lumi.entities.assets.list()
      // Remove duplicates based on symbol
      const uniqueAssets = list.filter((asset: Asset, index: number, self: Asset[]) => 
        index === self.findIndex((a: Asset) => a.symbol === asset.symbol)
      )
      setAssets(uniqueAssets)
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAssets = () => {
    let filtered = assets

    // Filter out already tracked assets
    const uniqueTrackedSymbols = [...new Set(trackedSymbols)]
    filtered = filtered.filter(asset => !uniqueTrackedSymbols.includes(asset.symbol))

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(asset => asset.type === selectedType)
    }

    // Filter by price range
    if (minPrice) {
      filtered = filtered.filter(asset => asset.currentPrice >= parseFloat(minPrice))
    }
    if (maxPrice) {
      filtered = filtered.filter(asset => asset.currentPrice <= parseFloat(maxPrice))
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort assets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.currentPrice - a.currentPrice
        case 'change':
          return b.priceChange24h - a.priceChange24h
        case 'sentiment':
          return b.sentimentScore - a.sentimentScore
        case 'popularity':
        default:
          const scoreA = (a.sentimentScore + 1) * a.confidenceLevel
          const scoreB = (b.sentimentScore + 1) * b.confidenceLevel
          return scoreB - scoreA
      }
    })

    // Remove any remaining duplicates
    const uniqueFiltered = filtered.filter((asset, index, self) => 
      index === self.findIndex(a => a.symbol === asset.symbol)
    )

    setFilteredAssets(uniqueFiltered)
  }

  const handleTrackAsset = (asset: Asset) => {
    if (trackedSymbols.includes(asset.symbol)) return
    
    if (bulkMode) {
      const newSelected = new Set(selectedAssets)
      if (newSelected.has(asset.symbol)) {
        newSelected.delete(asset.symbol)
      } else {
        newSelected.add(asset.symbol)
      }
      setSelectedAssets(newSelected)
    } else {
      onTrackAsset(asset)
    }
  }

  const handleBulkTrack = () => {
    const assetsToTrack = filteredAssets.filter(asset => selectedAssets.has(asset.symbol))
    onTrackMultipleAssets(assetsToTrack)
    setSelectedAssets(new Set())
    setBulkMode(false)
  }

  const toggleSelectAll = () => {
    if (selectedAssets.size === filteredAssets.length) {
      setSelectedAssets(new Set())
    } else {
      setSelectedAssets(new Set(filteredAssets.map(asset => asset.symbol)))
    }
  }

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-emerald-400'
    if (score < -0.3) return 'text-red-400'
    return 'text-amber-400'
  }

  const getSentimentIcon = (score: number) => {
    return score > 0 ? TrendingUp : TrendingDown
  }

  const formatPrice = (price: number, type: string) => {
    if (type === 'crypto' && price < 1) {
      return `$${price.toFixed(6)}`
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const popularAssets = assets
    .filter(asset => asset.sentimentScore > 0.5 && !trackedSymbols.includes(asset.symbol))
    .filter((asset, index, self) => index === self.findIndex(a => a.symbol === asset.symbol))
    .slice(0, 6)

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
          className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 w-full max-w-5xl max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800 dark:border-gray-800 light:border-gray-200">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-900">
                {t('search.title')}
              </h2>
              {bulkMode && (
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">{selectedAssets.size} selected</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setBulkMode(!bulkMode)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  bulkMode
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 dark:bg-gray-800 light:bg-gray-200 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-300'
                }`}
              >
                Bulk Mode
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-800 dark:border-gray-800 light:border-gray-200">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 dark:bg-gray-800 light:bg-gray-100 border border-gray-700 dark:border-gray-700 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-100 border border-gray-700 dark:border-gray-700 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">{t('common.all')}</option>
                  <option value="stock">Stocks</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-100 border border-gray-700 dark:border-gray-700 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price">Price</option>
                  <option value="change">Change %</option>
                  <option value="sentiment">Sentiment</option>
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">Min Price</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-100 border border-gray-700 dark:border-gray-700 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-1">Max Price</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-100 border border-gray-700 dark:border-gray-700 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {bulkMode && (
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {selectedAssets.size === filteredAssets.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  <span>Select All ({filteredAssets.length})</span>
                </button>
                {selectedAssets.size > 0 && (
                  <button
                    onClick={handleBulkTrack}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Track {selectedAssets.size} Assets
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {/* Popular Assets */}
                {!searchTerm && popularAssets.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-4">
                      {t('search.popular')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {popularAssets.map((asset) => {
                        const SentimentIcon = getSentimentIcon(asset.sentimentScore)
                        const isAlreadyTracked = trackedSymbols.includes(asset.symbol)
                        const isSelected = selectedAssets.has(asset.symbol)
                        
                        return (
                          <motion.div
                            key={asset.symbol}
                            whileHover={{ scale: 1.02 }}
                            className={`bg-gray-800 dark:bg-gray-800 light:bg-gray-100 rounded-lg p-4 border transition-colors cursor-pointer ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-500/10' 
                                : 'border-gray-700 dark:border-gray-700 light:border-gray-300 hover:border-gray-600 dark:hover:border-gray-600 light:hover:border-gray-400'
                            }`}
                            onClick={() => !isAlreadyTracked && handleTrackAsset(asset)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  {bulkMode && (
                                    <div className="flex items-center">
                                      {isSelected ? (
                                        <CheckSquare className="w-4 h-4 text-blue-400" />
                                      ) : (
                                        <Square className="w-4 h-4 text-gray-400" />
                                      )}
                                    </div>
                                  )}
                                  <span className="font-bold text-white dark:text-white light:text-gray-900">
                                    {asset.symbol}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    asset.type === 'stock' 
                                      ? 'bg-blue-500/20 text-blue-400' 
                                      : 'bg-purple-500/20 text-purple-400'
                                  }`}>
                                    {asset.type}
                                  </span>
                                </div>
                                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm truncate">
                                  {asset.name}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className="text-white dark:text-white light:text-gray-900 font-medium">
                                    {formatPrice(asset.currentPrice, asset.type)}
                                  </span>
                                  <span className={`text-sm font-medium ${
                                    asset.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                                  }`}>
                                    {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h.toFixed(2)}%
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <SentimentIcon className={`w-4 h-4 ${getSentimentColor(asset.sentimentScore)}`} />
                                    <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
                                      {asset.confidenceLevel}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {!bulkMode && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleTrackAsset(asset)
                                  }}
                                  disabled={isAlreadyTracked}
                                  className={`ml-4 p-2 rounded-lg transition-colors ${
                                    isAlreadyTracked
                                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                                  }`}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {(searchTerm || selectedType !== 'all' || minPrice || maxPrice) && (
                  <div>
                    <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900 mb-4">
                      {t('common.search')} {t('common.results')} ({filteredAssets.length})
                    </h3>
                    {filteredAssets.length === 0 ? (
                      <div className="text-center py-8">
                        <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                          {t('search.noResults')}
                        </p>
                        <p className="text-gray-500 text-sm">{t('search.tryDifferent')}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredAssets.map((asset) => {
                          const SentimentIcon = getSentimentIcon(asset.sentimentScore)
                          const isAlreadyTracked = trackedSymbols.includes(asset.symbol)
                          const isSelected = selectedAssets.has(asset.symbol)
                          
                          return (
                            <motion.div
                              key={asset.symbol}
                              whileHover={{ scale: 1.01 }}
                              className={`bg-gray-800 dark:bg-gray-800 light:bg-gray-100 rounded-lg p-4 border transition-colors cursor-pointer ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-500/10' 
                                  : 'border-gray-700 dark:border-gray-700 light:border-gray-300 hover:border-gray-600 dark:hover:border-gray-600 light:hover:border-gray-400'
                              }`}
                              onClick={() => !isAlreadyTracked && handleTrackAsset(asset)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    {bulkMode && (
                                      <div className="flex items-center">
                                        {isSelected ? (
                                          <CheckSquare className="w-4 h-4 text-blue-400" />
                                        ) : (
                                          <Square className="w-4 h-4 text-gray-400" />
                                        )}
                                      </div>
                                    )}
                                    <span className="font-bold text-white dark:text-white light:text-gray-900">
                                      {asset.symbol}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      asset.type === 'stock' 
                                        ? 'bg-blue-500/20 text-blue-400' 
                                        : 'bg-purple-500/20 text-purple-400'
                                    }`}>
                                      {asset.type}
                                    </span>
                                  </div>
                                  <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
                                    {asset.name}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-2">
                                    <span className="text-white dark:text-white light:text-gray-900 font-medium">
                                      {formatPrice(asset.currentPrice, asset.type)}
                                    </span>
                                    <span className={`text-sm font-medium ${
                                      asset.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                      {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h.toFixed(2)}%
                                    </span>
                                    <div className="flex items-center space-x-1">
                                      <SentimentIcon className={`w-4 h-4 ${getSentimentColor(asset.sentimentScore)}`} />
                                      <span className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
                                        {asset.confidenceLevel}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {!bulkMode && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleTrackAsset(asset)
                                    }}
                                    disabled={isAlreadyTracked}
                                    className={`ml-4 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                                      isAlreadyTracked
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>{isAlreadyTracked ? 'Tracked' : t('asset.track')}</span>
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
