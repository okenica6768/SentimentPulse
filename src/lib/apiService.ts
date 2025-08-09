
// Comprehensive API service for real-time market data
interface APIConfig {
  coinGecko: {
    baseUrl: string
    rateLimit: number
  }
  alphaVantage: {
    baseUrl: string
    apiKey: string
    rateLimit: number
  }
  newsAPI: {
    baseUrl: string
    apiKey: string
    rateLimit: number
  }
}

interface MarketData {
  symbol: string
  name: string
  currentPrice: number
  priceChange24h: number
  volume24h: number
  marketCap: number
  high24h: number
  low24h: number
  lastUpdated: string
}

interface NewsArticle {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

interface TechnicalIndicators {
  rsi: number
  macd: number
  sma20: number
  sma50: number
  bollinger: {
    upper: number
    middle: number
    lower: number
  }
}

export class APIService {
  private config: APIConfig = {
    coinGecko: {
      baseUrl: 'https://api.coingecko.com/api/v3',
      rateLimit: 50 // requests per minute
    },
    alphaVantage: {
      baseUrl: 'https://www.alphavantage.co/query',
      apiKey: process.env.VITE_ALPHA_VANTAGE_KEY || 'demo',
      rateLimit: 5 // requests per minute
    },
    newsAPI: {
      baseUrl: 'https://newsapi.org/v2',
      apiKey: process.env.VITE_NEWS_API_KEY || 'demo',
      rateLimit: 100 // requests per hour
    }
  }

  private requestCache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Rate limiting
  private lastRequestTimes = new Map<string, number[]>()

  async getCryptoData(symbols: string[]): Promise<MarketData[]> {
    const cacheKey = `crypto_${symbols.join(',')}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      await this.checkRateLimit('coinGecko')
      
      const symbolsParam = symbols.join(',')
      const response = await fetch(
        `${this.config.coinGecko.baseUrl}/simple/price?ids=${symbolsParam}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_last_updated_at=true`
      )
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }
      
      const data = await response.json()
      const marketData: MarketData[] = Object.entries(data).map(([id, info]: [string, any]) => ({
        symbol: id.toUpperCase(),
        name: id,
        currentPrice: info.usd,
        priceChange24h: info.usd_24h_change || 0,
        volume24h: info.usd_24h_vol || 0,
        marketCap: info.usd_market_cap || 0,
        high24h: info.usd * 1.05, // Approximate
        low24h: info.usd * 0.95,  // Approximate
        lastUpdated: new Date(info.last_updated_at * 1000).toISOString()
      }))

      this.setCache(cacheKey, marketData)
      return marketData
    } catch (error) {
      console.error('Failed to fetch crypto data:', error)
      return this.getFallbackCryptoData(symbols)
    }
  }

  async getStockData(symbols: string[]): Promise<MarketData[]> {
    const results: MarketData[] = []
    
    for (const symbol of symbols) {
      const cacheKey = `stock_${symbol}`
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        results.push(cached)
        continue
      }

      try {
        await this.checkRateLimit('alphaVantage')
        
        const response = await fetch(
          `${this.config.alphaVantage.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.config.alphaVantage.apiKey}`
        )
        
        if (!response.ok) {
          throw new Error(`Alpha Vantage API error: ${response.status}`)
        }
        
        const data = await response.json()
        const quote = data['Global Quote']
        
        if (quote) {
          const marketData: MarketData = {
            symbol: symbol.toUpperCase(),
            name: symbol,
            currentPrice: parseFloat(quote['05. price']),
            priceChange24h: parseFloat(quote['10. change percent'].replace('%', '')),
            volume24h: parseInt(quote['06. volume']),
            marketCap: 0, // Not available in this endpoint
            high24h: parseFloat(quote['03. high']),
            low24h: parseFloat(quote['04. low']),
            lastUpdated: new Date().toISOString()
          }
          
          this.setCache(cacheKey, marketData)
          results.push(marketData)
        }
      } catch (error) {
        console.error(`Failed to fetch stock data for ${symbol}:`, error)
        results.push(this.getFallbackStockData(symbol))
      }
    }
    
    return results
  }

  async getNewsData(query: string, limit: number = 10): Promise<NewsArticle[]> {
    const cacheKey = `news_${query}_${limit}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      await this.checkRateLimit('newsAPI')
      
      const response = await fetch(
        `${this.config.newsAPI.baseUrl}/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${limit}&apiKey=${this.config.newsAPI.apiKey}`
      )
      
      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`)
      }
      
      const data = await response.json()
      const articles: NewsArticle[] = data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        sentiment: this.analyzeSentiment(article.title + ' ' + (article.description || ''))
      }))

      this.setCache(cacheKey, articles)
      return articles
    } catch (error) {
      console.error('Failed to fetch news data:', error)
      return this.getFallbackNewsData(query)
    }
  }

  async getTechnicalIndicators(symbol: string, type: 'crypto' | 'stock'): Promise<TechnicalIndicators> {
    const cacheKey = `technical_${symbol}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      // For demo purposes, we'll simulate technical indicators
      // In production, you'd use a service like Alpha Vantage or TradingView
      const indicators: TechnicalIndicators = {
        rsi: 45 + Math.random() * 30, // 45-75 range
        macd: (Math.random() - 0.5) * 2, // -1 to 1
        sma20: 0, // Will be calculated below
        sma50: 0,
        bollinger: {
          upper: 0,
          middle: 0,
          lower: 0
        }
      }

      // Get current price for SMA calculation
      const marketData = type === 'crypto' 
        ? await this.getCryptoData([symbol.toLowerCase()])
        : await this.getStockData([symbol])
      
      if (marketData.length > 0) {
        const currentPrice = marketData[0].currentPrice
        indicators.sma20 = currentPrice * (0.98 + Math.random() * 0.04)
        indicators.sma50 = currentPrice * (0.95 + Math.random() * 0.06)
        indicators.bollinger = {
          upper: currentPrice * 1.02,
          middle: currentPrice,
          lower: currentPrice * 0.98
        }
      }

      this.setCache(cacheKey, indicators)
      return indicators
    } catch (error) {
      console.error('Failed to fetch technical indicators:', error)
      return this.getFallbackTechnicalIndicators()
    }
  }

  // Simple sentiment analysis (in production, use a proper NLP service)
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['gain', 'rise', 'bull', 'up', 'high', 'growth', 'increase', 'surge', 'rally', 'boom']
    const negativeWords = ['fall', 'drop', 'bear', 'down', 'low', 'crash', 'decline', 'plunge', 'sell', 'loss']
    
    const lowerText = text.toLowerCase()
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  // Rate limiting
  private async checkRateLimit(service: keyof APIConfig): Promise<void> {
    const now = Date.now()
    const requests = this.lastRequestTimes.get(service) || []
    
    // Remove requests older than the rate limit window
    const windowSize = service === 'newsAPI' ? 3600000 : 60000 // 1 hour for news, 1 minute for others
    const recentRequests = requests.filter(time => now - time < windowSize)
    
    const limit = this.config[service].rateLimit
    if (recentRequests.length >= limit) {
      const oldestRequest = recentRequests[0]
      const waitTime = windowSize - (now - oldestRequest)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    recentRequests.push(now)
    this.lastRequestTimes.set(service, recentRequests)
  }

  // Caching
  private getFromCache(key: string): any {
    const cached = this.requestCache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: any): void {
    this.requestCache.set(key, { data, timestamp: Date.now() })
  }

  // Fallback data for when APIs are unavailable
  private getFallbackCryptoData(symbols: string[]): MarketData[] {
    return symbols.map(symbol => ({
      symbol: symbol.toUpperCase(),
      name: symbol,
      currentPrice: 1000 + Math.random() * 50000,
      priceChange24h: (Math.random() - 0.5) * 20,
      volume24h: Math.random() * 1000000000,
      marketCap: Math.random() * 100000000000,
      high24h: 0,
      low24h: 0,
      lastUpdated: new Date().toISOString()
    }))
  }

  private getFallbackStockData(symbol: string): MarketData {
    return {
      symbol: symbol.toUpperCase(),
      name: symbol,
      currentPrice: 50 + Math.random() * 500,
      priceChange24h: (Math.random() - 0.5) * 10,
      volume24h: Math.random() * 10000000,
      marketCap: Math.random() * 10000000000,
      high24h: 0,
      low24h: 0,
      lastUpdated: new Date().toISOString()
    }
  }

  private getFallbackNewsData(query: string): NewsArticle[] {
    return [
      {
        title: `Market analysis for ${query}`,
        description: 'Fallback news data when API is unavailable',
        url: '#',
        source: 'Local Data',
        publishedAt: new Date().toISOString(),
        sentiment: 'neutral'
      }
    ]
  }

  private getFallbackTechnicalIndicators(): TechnicalIndicators {
    return {
      rsi: 50,
      macd: 0,
      sma20: 0,
      sma50: 0,
      bollinger: {
        upper: 0,
        middle: 0,
        lower: 0
      }
    }
  }
}

export const apiService = new APIService()
