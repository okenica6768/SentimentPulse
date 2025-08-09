
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart3, Calendar, Activity, Zap } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

interface Asset {
  symbol: string
  name: string
  type: 'stock' | 'crypto'
  currentPrice: number
  priceChange24h: number
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
}

interface ChartData {
  time: string
  price: number
  volume: number
  high: number
  low: number
  open: number
  close: number
}

interface AssetChartProps {
  asset: Asset
}

export default function AssetChart({ asset }: AssetChartProps) {
  const { t } = useLanguage()
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | 'MAX'>('1D')
  const [showIndicators, setShowIndicators] = useState(true)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateChartData()
  }, [timeframe, asset.symbol])

  const generateChartData = () => {
    setLoading(true)
    
    // Generate realistic chart data based on timeframe
    const dataPoints = getDataPoints(timeframe)
    const basePrice = asset.currentPrice
    const data: ChartData[] = []
    
    for (let i = 0; i < dataPoints; i++) {
      const time = getTimeLabel(i, timeframe)
      const volatility = asset.type === 'crypto' ? 0.05 : 0.02
      const trend = asset.priceChange24h > 0 ? 0.001 : -0.001
      
      const priceChange = (Math.random() - 0.5) * volatility + trend
      const price = i === 0 ? basePrice : data[i - 1].close * (1 + priceChange)
      
      const high = price * (1 + Math.random() * 0.02)
      const low = price * (1 - Math.random() * 0.02)
      const open = i === 0 ? price : data[i - 1].close
      const close = price
      const volume = Math.random() * 1000000 + 500000
      
      data.push({
        time,
        price: close,
        volume,
        high,
        low,
        open,
        close
      })
    }
    
    setChartData(data.reverse()) // Reverse to show latest first
    setLoading(false)
  }

  const getDataPoints = (timeframe: string) => {
    switch (timeframe) {
      case '1D': return 24
      case '1W': return 7
      case '1M': return 30
      case '1Y': return 12
      case 'MAX': return 60
      default: return 24
    }
  }

  const getTimeLabel = (index: number, timeframe: string) => {
    const now = new Date()
    switch (timeframe) {
      case '1D':
        return new Date(now.getTime() - (23 - index) * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      case '1W':
        return new Date(now.getTime() - (6 - index) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' })
      case '1M':
        return new Date(now.getTime() - (29 - index) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { day: 'numeric' })
      case '1Y':
        return new Date(now.getTime() - (11 - index) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' })
      case 'MAX':
        return new Date(now.getTime() - (59 - index) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: '2-digit' })
      default:
        return now.toLocaleTimeString()
    }
  }

  const formatPrice = (price: number) => {
    if (asset.type === 'crypto' && price < 1) {
      return `$${price.toFixed(6)}`
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getMaxPrice = () => Math.max(...chartData.map(d => d.high))
  const getMinPrice = () => Math.min(...chartData.map(d => d.low))
  const getPriceRange = () => getMaxPrice() - getMinPrice()

  const getYPosition = (price: number) => {
    const range = getPriceRange()
    const normalized = (price - getMinPrice()) / range
    return 200 - (normalized * 180) // 200px height, 10px padding top/bottom
  }

  const timeframes = [
    { value: '1D', label: '1D' },
    { value: '1W', label: '1W' },
    { value: '1M', label: '1M' },
    { value: '1Y', label: '1Y' },
    { value: 'MAX', label: 'MAX' }
  ]

  return (
    <div className="bg-gray-800 dark:bg-gray-800 light:bg-gray-100 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
            {asset.symbol} {t('analysis.priceChart')}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowIndicators(!showIndicators)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              showIndicators
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 dark:bg-gray-700 light:bg-gray-300 text-gray-300 dark:text-gray-300 light:text-gray-700'
            }`}
          >
            Indicators
          </button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center space-x-2 mb-6">
        {timeframes.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value as any)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeframe === tf.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 dark:bg-gray-700 light:bg-gray-300 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-gray-600 dark:hover:bg-gray-600 light:hover:bg-gray-400'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="relative bg-gray-900 dark:bg-gray-900 light:bg-white rounded-lg p-4 mb-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="relative h-64 w-full">
            {/* Price Grid Lines */}
            <div className="absolute inset-0">
              {[0, 25, 50, 75, 100].map((percent) => (
                <div
                  key={percent}
                  className="absolute w-full border-t border-gray-700 dark:border-gray-700 light:border-gray-300 opacity-30"
                  style={{ top: `${percent}%` }}
                />
              ))}
            </div>

            {/* Price Labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">
              <span>{formatPrice(getMaxPrice())}</span>
              <span>{formatPrice(getMaxPrice() * 0.75 + getMinPrice() * 0.25)}</span>
              <span>{formatPrice((getMaxPrice() + getMinPrice()) / 2)}</span>
              <span>{formatPrice(getMaxPrice() * 0.25 + getMinPrice() * 0.75)}</span>
              <span>{formatPrice(getMinPrice())}</span>
            </div>

            {/* Chart Line */}
            <svg className="absolute inset-0 w-full h-full" style={{ marginLeft: '60px', width: 'calc(100% - 60px)' }}>
              {/* Price Line */}
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                points={chartData.map((point, index) => {
                  const x = (index / (chartData.length - 1)) * 100
                  const y = ((getMaxPrice() - point.close) / getPriceRange()) * 100
                  return `${x}%,${y}%`
                }).join(' ')}
                className="drop-shadow-lg"
              />

              {/* Area Fill */}
              <defs>
                <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <polygon
                fill="url(#priceGradient)"
                points={[
                  ...chartData.map((point, index) => {
                    const x = (index / (chartData.length - 1)) * 100
                    const y = ((getMaxPrice() - point.close) / getPriceRange()) * 100
                    return `${x}%,${y}%`
                  }),
                  `100%,100%`,
                  `0%,100%`
                ].join(' ')}
              />

              {/* Moving Averages */}
              {showIndicators && asset.technicalIndicators && (
                <>
                  {/* SMA 20 */}
                  <polyline
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    points={chartData.map((point, index) => {
                      const x = (index / (chartData.length - 1)) * 100
                      const y = ((getMaxPrice() - asset.technicalIndicators!.sma20) / getPriceRange()) * 100
                      return `${x}%,${y}%`
                    }).join(' ')}
                    opacity="0.7"
                  />
                  
                  {/* SMA 50 */}
                  <polyline
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="1"
                    strokeDasharray="10,5"
                    points={chartData.map((point, index) => {
                      const x = (index / (chartData.length - 1)) * 100
                      const y = ((getMaxPrice() - asset.technicalIndicators!.sma50) / getPriceRange()) * 100
                      return `${x}%,${y}%`
                    }).join(' ')}
                    opacity="0.7"
                  />
                </>
              )}

              {/* Data Points */}
              {chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 100
                const y = ((getMaxPrice() - point.close) / getPriceRange()) * 100
                return (
                  <circle
                    key={index}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="2"
                    fill="#3B82F6"
                    className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <title>{`${point.time}: ${formatPrice(point.close)}`}</title>
                  </circle>
                )
              })}
            </svg>

            {/* Time Labels */}
            <div className="absolute bottom-0 w-full flex justify-between text-xs text-gray-400 dark:text-gray-400 light:text-gray-600" style={{ marginLeft: '60px', width: 'calc(100% - 60px)' }}>
              <span>{chartData[0]?.time}</span>
              <span>{chartData[Math.floor(chartData.length / 2)]?.time}</span>
              <span>{chartData[chartData.length - 1]?.time}</span>
            </div>
          </div>
        )}
      </div>

      {/* Technical Indicators Legend */}
      {showIndicators && asset.technicalIndicators && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">Price</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-amber-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #F59E0B 0, #F59E0B 5px, transparent 5px, transparent 10px)' }}></div>
            <span className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">SMA 20</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-red-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #EF4444 0, #EF4444 10px, transparent 10px, transparent 15px)' }}></div>
            <span className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">SMA 50</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">RSI: {asset.technicalIndicators.rsi.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
