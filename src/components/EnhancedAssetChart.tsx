
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Bar
} from 'recharts'
import { TrendingUp, TrendingDown, BarChart3, Activity, Volume2, Target } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { Asset } from '../types/Asset'

interface ChartData {
  time: string
  price: number
  volume: number
  sma20?: number
  sma50?: number
  rsi?: number
  upperBB?: number
  lowerBB?: number
}

interface EnhancedAssetChartProps {
  asset: Asset
  height?: number
  showVolume?: boolean
  showIndicators?: boolean
}

export default function EnhancedAssetChart({ 
  asset, 
  height = 400, 
  showVolume = true, 
  showIndicators = true 
}: EnhancedAssetChartProps) {
  const { t } = useLanguage()
  const [timeframe, setTimeframe] = useState<'1H' | '1D' | '1W' | '1M' | '1Y'>('1D')
  const [chartType, setChartType] = useState<'line' | 'candlestick' | 'area'>('line')
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['sma20', 'sma50'])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateEnhancedChartData()
  }, [timeframe, asset.symbol])

  const generateEnhancedChartData = () => {
    setLoading(true)
    
    const dataPoints = getDataPoints(timeframe)
    const basePrice = asset.currentPrice
    const data: ChartData[] = []
    
    // Generate more realistic price movements
    let currentPrice = basePrice
    const volatility = asset.type === 'crypto' ? 0.03 : 0.015
    const trend = asset.priceChange24h > 0 ? 0.0005 : -0.0005

    for (let i = 0; i < dataPoints; i++) {
      const time = getTimeLabel(i, timeframe, dataPoints)
      
      // Price movement with trend and mean reversion
      const randomWalk = (Math.random() - 0.5) * volatility
      const meanReversion = (basePrice - currentPrice) * 0.001
      const priceChange = randomWalk + trend + meanReversion
      
      currentPrice = Math.max(0.000001, currentPrice * (1 + priceChange))
      
      // Volume with realistic patterns
      const baseVolume = asset.volume24h || 1000000
      const volumeVariation = 0.5 + Math.random() * 1.5
      const volume = baseVolume * volumeVariation / dataPoints

      // Technical indicators
      const sma20 = calculateSMA(data, 20, currentPrice)
      const sma50 = calculateSMA(data, 50, currentPrice)
      const rsi = calculateRSI(data, currentPrice)
      
      data.push({
        time,
        price: currentPrice,
        volume,
        sma20,
        sma50,
        rsi,
        upperBB: currentPrice * 1.02,
        lowerBB: currentPrice * 0.98
      })
    }
    
    setChartData(data)
    setLoading(false)
  }

  const calculateSMA = (data: ChartData[], period: number, currentPrice: number): number => {
    if (data.length < period) return currentPrice
    const prices = data.slice(-period + 1).map(d => d.price)
    prices.push(currentPrice)
    return prices.reduce((sum, price) => sum + price, 0) / prices.length
  }

  const calculateRSI = (data: ChartData[], currentPrice: number): number => {
    if (data.length < 14) return 50
    
    const prices = data.slice(-14).map(d => d.price)
    prices.push(currentPrice)
    
    let gains = 0
    let losses = 0
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      if (change > 0) gains += change
      else losses += Math.abs(change)
    }
    
    const avgGain = gains / 14
    const avgLoss = losses / 14
    
    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }

  const getDataPoints = (timeframe: string): number => {
    switch (timeframe) {
      case '1H': return 60
      case '1D': return 24
      case '1W': return 7
      case '1M': return 30
      case '1Y': return 12
      default: return 24
    }
  }

  const getTimeLabel = (index: number, timeframe: string, total: number): string => {
    const now = new Date()
    const interval = getTimeInterval(timeframe)
    const time = new Date(now.getTime() - (total - 1 - index) * interval)
    
    switch (timeframe) {
      case '1H':
        return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      case '1D':
        return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      case '1W':
        return time.toLocaleDateString('en-US', { weekday: 'short' })
      case '1M':
        return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      case '1Y':
        return time.toLocaleDateString('en-US', { month: 'short' })
      default:
        return time.toLocaleTimeString()
    }
  }

  const getTimeInterval = (timeframe: string): number => {
    switch (timeframe) {
      case '1H': return 60 * 1000 // 1 minute
      case '1D': return 60 * 60 * 1000 // 1 hour
      case '1W': return 24 * 60 * 60 * 1000 // 1 day
      case '1M': return 24 * 60 * 60 * 1000 // 1 day
      case '1Y': return 30 * 24 * 60 * 60 * 1000 // 30 days
      default: return 60 * 60 * 1000
    }
  }

  const formatPrice = (value: number) => {
    if (asset.type === 'crypto' && value < 1) {
      return `$${value.toFixed(6)}`
    }
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
    return value.toFixed(0)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 dark:bg-gray-800 light:bg-white border border-gray-700 dark:border-gray-700 light:border-gray-300 rounded-lg p-3 shadow-lg">
          <p className="text-white dark:text-white light:text-gray-900 font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.name === 'volume' ? formatVolume(entry.value) : formatPrice(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const timeframes = [
    { value: '1H', label: '1H' },
    { value: '1D', label: '1D' },
    { value: '1W', label: '1W' },
    { value: '1M', label: '1M' },
    { value: '1Y', label: '1Y' }
  ]

  const chartTypes = [
    { value: 'line', label: 'Line', icon: TrendingUp },
    { value: 'area', label: 'Area', icon: Activity },
    { value: 'candlestick', label: 'Candles', icon: BarChart3 }
  ]

  const indicators = [
    { id: 'sma20', label: 'SMA 20', color: '#F59E0B' },
    { id: 'sma50', label: 'SMA 50', color: '#EF4444' },
    { id: 'bollinger', label: 'Bollinger Bands', color: '#8B5CF6' }
  ]

  const toggleIndicator = (indicatorId: string) => {
    setActiveIndicators(prev => 
      prev.includes(indicatorId) 
        ? prev.filter(id => id !== indicatorId)
        : [...prev, indicatorId]
    )
  }

  return (
    <div className="bg-gray-800 dark:bg-gray-800 light:bg-gray-100 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
            {asset.symbol} Advanced Chart
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
            {formatPrice(asset.currentPrice)}
          </span>
          <span className={`text-sm font-medium ${
            asset.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Timeframe Selector */}
        <div className="flex items-center space-x-2">
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

        {/* Chart Type Selector */}
        <div className="flex items-center space-x-2">
          {chartTypes.map((type) => {
            const IconComponent = type.icon
            return (
              <button
                key={type.value}
                onClick={() => setChartType(type.value as any)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartType === type.value
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 dark:bg-gray-700 light:bg-gray-300 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-gray-600 dark:hover:bg-gray-600 light:hover:bg-gray-400'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{type.label}</span>
              </button>
            )
          })}
        </div>

        {/* Indicators Toggle */}
        {showIndicators && (
          <div className="flex items-center space-x-2">
            {indicators.map((indicator) => (
              <button
                key={indicator.id}
                onClick={() => toggleIndicator(indicator.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeIndicators.includes(indicator.id)
                    ? 'text-white'
                    : 'bg-gray-700 dark:bg-gray-700 light:bg-gray-300 text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-gray-600 dark:hover:bg-gray-600 light:hover:bg-gray-400'
                }`}
                style={activeIndicators.includes(indicator.id) ? { backgroundColor: indicator.color } : {}}
              >
                {indicator.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart Area */}
      <div className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-lg p-4">
        {loading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                yAxisId="price"
                domain={['dataMin * 0.995', 'dataMax * 1.005']}
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                tickFormatter={formatPrice}
              />
              {showVolume && (
                <YAxis 
                  yAxisId="volume"
                  orientation="right"
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={formatVolume}
                />
              )}
              <Tooltip content={<CustomTooltip />} />

              {/* Volume Bars */}
              {showVolume && (
                <Bar 
                  yAxisId="volume"
                  dataKey="volume" 
                  fill="#3B82F6" 
                  opacity={0.3}
                  name="Volume"
                />
              )}

              {/* Price Line/Area */}
              {chartType === 'area' ? (
                <Area
                  yAxisId="price"
                  type="monotone"
                  dataKey="price"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  name="Price"
                />
              ) : (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="price"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                  name="Price"
                />
              )}

              {/* Technical Indicators */}
              {activeIndicators.includes('sma20') && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="sma20"
                  stroke="#F59E0B"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="SMA 20"
                />
              )}

              {activeIndicators.includes('sma50') && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="sma50"
                  stroke="#EF4444"
                  strokeWidth={1}
                  strokeDasharray="10 5"
                  dot={false}
                  name="SMA 50"
                />
              )}

              {/* Bollinger Bands */}
              {activeIndicators.includes('bollinger') && (
                <>
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="upperBB"
                    stroke="#8B5CF6"
                    strokeWidth={1}
                    strokeOpacity={0.6}
                    dot={false}
                    name="Upper BB"
                  />
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="lowerBB"
                    stroke="#8B5CF6"
                    strokeWidth={1}
                    strokeOpacity={0.6}
                    dot={false}
                    name="Lower BB"
                  />
                </>
              )}

              {/* Reference Lines */}
              <ReferenceLine 
                yAxisId="price"
                y={asset.currentPrice} 
                stroke="#6B7280" 
                strokeDasharray="2 2" 
                opacity={0.5}
              />

              {/* Gradient Definition */}
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="text-center">
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs">High</p>
          <p className="text-white dark:text-white light:text-gray-900 font-medium">
            {formatPrice(Math.max(...chartData.map(d => d.price)))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs">Low</p>
          <p className="text-white dark:text-white light:text-gray-900 font-medium">
            {formatPrice(Math.min(...chartData.map(d => d.price)))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs">Avg Volume</p>
          <p className="text-white dark:text-white light:text-gray-900 font-medium">
            {formatVolume(chartData.reduce((sum, d) => sum + d.volume, 0) / chartData.length)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-xs">Volatility</p>
          <p className="text-white dark:text-white light:text-gray-900 font-medium">
            {((Math.max(...chartData.map(d => d.price)) - Math.min(...chartData.map(d => d.price))) / asset.currentPrice * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  )
}
