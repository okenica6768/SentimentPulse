
// Comprehensive type definitions for the application
export interface Asset {
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
  newsArticles?: NewsArticle[]
  technicalIndicators?: TechnicalIndicators
  socialMetrics?: SocialMetrics
  lastAnalyzed?: string
  weekHigh52?: number
  weekLow52?: number
  allTimeHigh?: number
  allTimeLow?: number
  forecast?: ForecastResult
}

export interface NewsArticle {
  title: string
  description?: string
  url: string
  source: string
  publishedAt: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

export interface TechnicalIndicators {
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

export interface SocialMetrics {
  twitterMentions: number
  redditPosts: number
  socialSentiment: number
}

export interface ForecastResult {
  prediction: {
    price: number
    direction: 'bullish' | 'bearish' | 'neutral'
    confidence: number
    timeframe: string
  }
  factors: {
    sentiment: number
    technical: number
    volume: number
    social: number
  }
  riskLevel: 'low' | 'medium' | 'high'
  reasoning: string[]
}

export interface UserAsset {
  _id?: string
  userId: string
  assetSymbol: string
  isTracked: boolean
  alertThresholds?: {
    priceUp?: number
    priceDown?: number
    sentimentChange?: number
  }
  createdAt?: string
  updatedAt?: string
}

export interface Alert {
  _id?: string
  userId: string
  assetSymbol: string
  type: 'price_up' | 'price_down' | 'sentiment_change' | 'volume_spike'
  threshold: number
  currentValue: number
  triggered: boolean
  message: string
  createdAt: string
  triggeredAt?: string
}

export interface Subscription {
  _id?: string
  userId: string
  plan: 'free' | 'pro' | 'premium'
  status: 'active' | 'cancelled' | 'expired'
  startDate: string
  endDate?: string
  promoCode?: string
  features: {
    maxAssets: number
    realTimeAlerts: boolean
    advancedAnalytics: boolean
    apiAccess: boolean
    customModels: boolean
  }
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  language: 'en' | 'sk'
  notifications: {
    email: boolean
    push: boolean
    priceAlerts: boolean
    sentimentAlerts: boolean
  }
  dashboard: {
    defaultView: 'grid' | 'list'
    assetsPerPage: number
    autoRefresh: boolean
    refreshInterval: number
  }
}
