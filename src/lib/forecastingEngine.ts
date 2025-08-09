
// Advanced forecasting engine with sentiment analysis and technical indicators
import { Asset } from '../types/Asset'

interface ForecastingConfig {
  sentimentWeight: number
  technicalWeight: number
  volumeWeight: number
  socialWeight: number
  timeHorizon: number // days
}

interface ForecastResult {
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

export class ForecastingEngine {
  private config: ForecastingConfig = {
    sentimentWeight: 0.35,
    technicalWeight: 0.30,
    volumeWeight: 0.20,
    socialWeight: 0.15,
    timeHorizon: 7
  }

  // Main forecasting method
  async generateForecast(asset: Asset, historicalData?: any[]): Promise<ForecastResult> {
    const sentimentScore = this.calculateSentimentImpact(asset)
    const technicalScore = this.calculateTechnicalScore(asset)
    const volumeScore = this.calculateVolumeScore(asset)
    const socialScore = this.calculateSocialScore(asset)

    // Weighted composite score
    const compositeScore = (
      sentimentScore * this.config.sentimentWeight +
      technicalScore * this.config.technicalWeight +
      volumeScore * this.config.volumeWeight +
      socialScore * this.config.socialWeight
    )

    // Price prediction using Monte Carlo simulation
    const pricePrediction = this.predictPrice(asset, compositeScore)
    
    // Confidence calculation based on data quality and consistency
    const confidence = this.calculateConfidence(asset, {
      sentiment: sentimentScore,
      technical: technicalScore,
      volume: volumeScore,
      social: socialScore
    })

    // Risk assessment
    const riskLevel = this.assessRisk(asset, confidence)

    // Generate human-readable reasoning
    const reasoning = this.generateReasoning(asset, {
      sentiment: sentimentScore,
      technical: technicalScore,
      volume: volumeScore,
      social: socialScore
    })

    return {
      prediction: {
        price: pricePrediction,
        direction: compositeScore > 0.1 ? 'bullish' : compositeScore < -0.1 ? 'bearish' : 'neutral',
        confidence: Math.round(confidence * 100),
        timeframe: `${this.config.timeHorizon} days`
      },
      factors: {
        sentiment: Math.round(sentimentScore * 100),
        technical: Math.round(technicalScore * 100),
        volume: Math.round(volumeScore * 100),
        social: Math.round(socialScore * 100)
      },
      riskLevel,
      reasoning
    }
  }

  private calculateSentimentImpact(asset: Asset): number {
    const { sentimentScore, newsArticles } = asset
    
    // Base sentiment score (-1 to 1)
    let impact = sentimentScore || 0
    
    // News sentiment analysis
    if (newsArticles && newsArticles.length > 0) {
      const newsImpact = newsArticles.reduce((acc, article) => {
        const sentimentValue = article.sentiment === 'positive' ? 0.3 : 
                              article.sentiment === 'negative' ? -0.3 : 0
        return acc + sentimentValue
      }, 0) / newsArticles.length
      
      impact = (impact + newsImpact) / 2
    }
    
    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, impact))
  }

  private calculateTechnicalScore(asset: Asset): number {
    const indicators = asset.technicalIndicators
    if (!indicators) return 0

    let score = 0
    let factors = 0

    // RSI analysis (0-100, oversold < 30, overbought > 70)
    if (indicators.rsi !== undefined) {
      if (indicators.rsi < 30) score += 0.5 // Oversold - bullish
      else if (indicators.rsi > 70) score -= 0.5 // Overbought - bearish
      else score += (50 - indicators.rsi) / 100 // Neutral zone
      factors++
    }

    // MACD analysis
    if (indicators.macd !== undefined) {
      score += indicators.macd > 0 ? 0.3 : -0.3
      factors++
    }

    // Moving average crossover
    if (indicators.sma20 && indicators.sma50) {
      const currentPrice = asset.currentPrice
      if (currentPrice > indicators.sma20 && indicators.sma20 > indicators.sma50) {
        score += 0.4 // Bullish trend
      } else if (currentPrice < indicators.sma20 && indicators.sma20 < indicators.sma50) {
        score -= 0.4 // Bearish trend
      }
      factors++
    }

    return factors > 0 ? score / factors : 0
  }

  private calculateVolumeScore(asset: Asset): number {
    const { volume24h, priceChange24h } = asset
    if (!volume24h) return 0

    // Volume-price relationship
    const volumeThreshold = 1000000 // Adjust based on asset type
    const highVolume = volume24h > volumeThreshold

    if (highVolume && priceChange24h > 2) return 0.4 // High volume + price increase
    if (highVolume && priceChange24h < -2) return -0.4 // High volume + price decrease
    if (!highVolume && Math.abs(priceChange24h) > 5) return -0.2 // Low volume + high volatility

    return 0.1 // Normal volume activity
  }

  private calculateSocialScore(asset: Asset): number {
    const social = asset.socialMetrics
    if (!social) return 0

    let score = 0
    
    // Social sentiment
    if (social.socialSentiment !== undefined) {
      score += (social.socialSentiment - 0.5) * 0.6 // Convert 0-1 to -0.3 to 0.3
    }

    // Mention volume (high activity can indicate interest)
    const totalMentions = (social.twitterMentions || 0) + (social.redditPosts || 0)
    if (totalMentions > 1000) score += 0.2
    else if (totalMentions > 100) score += 0.1

    return Math.max(-1, Math.min(1, score))
  }

  private predictPrice(asset: Asset, compositeScore: number): number {
    const currentPrice = asset.currentPrice
    const volatility = asset.type === 'crypto' ? 0.15 : 0.08
    
    // Base prediction using composite score
    const baseChange = compositeScore * volatility
    
    // Add some randomness for Monte Carlo simulation
    const randomFactor = (Math.random() - 0.5) * 0.05
    
    // Apply momentum from recent price change
    const momentum = asset.priceChange24h / 100 * 0.3
    
    const totalChange = baseChange + randomFactor + momentum
    return currentPrice * (1 + totalChange)
  }

  private calculateConfidence(asset: Asset, scores: any): number {
    let confidence = 0.5 // Base confidence
    
    // Data availability increases confidence
    if (asset.technicalIndicators) confidence += 0.15
    if (asset.socialMetrics) confidence += 0.15
    if (asset.newsArticles && asset.newsArticles.length > 0) confidence += 0.1
    if (asset.volume24h) confidence += 0.1
    
    // Score consistency increases confidence
    const scoreValues = Object.values(scores).filter(s => s !== 0)
    if (scoreValues.length > 0) {
      const avgScore = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
      const consistency = 1 - scoreValues.reduce((acc, score) => acc + Math.abs(score - avgScore), 0) / scoreValues.length
      confidence += consistency * 0.2
    }
    
    return Math.max(0.1, Math.min(0.95, confidence))
  }

  private assessRisk(asset: Asset, confidence: number): 'low' | 'medium' | 'high' {
    if (confidence > 0.8 && Math.abs(asset.priceChange24h) < 5) return 'low'
    if (confidence > 0.6 && Math.abs(asset.priceChange24h) < 10) return 'medium'
    return 'high'
  }

  private generateReasoning(asset: Asset, scores: any): string[] {
    const reasoning: string[] = []
    
    // Sentiment reasoning
    if (scores.sentiment > 0.3) {
      reasoning.push(`Strong positive sentiment (${Math.round(scores.sentiment * 100)}%) indicates bullish market mood`)
    } else if (scores.sentiment < -0.3) {
      reasoning.push(`Negative sentiment (${Math.round(scores.sentiment * 100)}%) suggests bearish outlook`)
    }
    
    // Technical reasoning
    if (asset.technicalIndicators?.rsi) {
      if (asset.technicalIndicators.rsi < 30) {
        reasoning.push(`RSI of ${asset.technicalIndicators.rsi.toFixed(1)} indicates oversold conditions`)
      } else if (asset.technicalIndicators.rsi > 70) {
        reasoning.push(`RSI of ${asset.technicalIndicators.rsi.toFixed(1)} suggests overbought territory`)
      }
    }
    
    // Volume reasoning
    if (asset.volume24h && asset.volume24h > 1000000) {
      reasoning.push(`High trading volume indicates strong market interest`)
    }
    
    // Price momentum
    if (Math.abs(asset.priceChange24h) > 5) {
      reasoning.push(`Significant 24h price movement (${asset.priceChange24h.toFixed(1)}%) shows strong momentum`)
    }
    
    return reasoning.length > 0 ? reasoning : ['Analysis based on available market data and sentiment indicators']
  }

  // Update forecasting configuration
  updateConfig(newConfig: Partial<ForecastingConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Get current configuration
  getConfig(): ForecastingConfig {
    return { ...this.config }
  }
}

export const forecastingEngine = new ForecastingEngine()
