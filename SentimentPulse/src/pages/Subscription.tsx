
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Crown, Check, Zap, Star, Gift } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface Subscription {
  _id?: string
  userId: string
  plan: 'free' | 'pro' | 'premium'
  status: 'active' | 'cancelled' | 'expired'
  startDate: string
  endDate?: string
  promoCode?: string
}

export default function Subscription() {
  const { user, isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [promoCode, setPromoCode] = useState('')
  const [showPromoInput, setShowPromoInput] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscription()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchSubscription = async () => {
    try {
      const { list } = await lumi.entities.subscriptions.list()
      const userSub = list.find((sub: Subscription) => sub.userId === user?.userId)
      setCurrentSubscription(userSub || null)
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePromoCode = async () => {
    if (!isAuthenticated) {
      toast.error(t('auth.signInRequired'))
      return
    }

    if (promoCode.toLowerCase() === 'fasb99rfa9') {
      try {
        const subscriptionData = {
          userId: user?.userId!,
          plan: 'premium' as const, // Premium is now the best tier
          status: 'active' as const,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          promoCode: promoCode,
          creator: user?.userId!,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        if (currentSubscription) {
          await lumi.entities.subscriptions.update(currentSubscription._id!, subscriptionData)
        } else {
          await lumi.entities.subscriptions.create(subscriptionData)
        }

        await fetchSubscription()
        setPromoCode('')
        setShowPromoInput(false)
        toast.success('Promo code applied! You now have Premium access.')
      } catch (error) {
        console.error('Failed to apply promo code:', error)
        toast.error(t('common.error'))
      }
    } else {
      toast.error('Invalid promo code. Please try again.')
    }
  }

  const handleUpgrade = async (plan: 'pro' | 'premium') => {
    if (!isAuthenticated) {
      toast.error(t('auth.signInRequired'))
      return
    }

    try {
      const subscriptionData = {
        userId: user?.userId!,
        plan,
        status: 'active' as const,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        creator: user?.userId!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (currentSubscription) {
        await lumi.entities.subscriptions.update(currentSubscription._id!, subscriptionData)
      } else {
        await lumi.entities.subscriptions.create(subscriptionData)
      }

      await fetchSubscription()
      toast.success(t('success.updated'))
    } catch (error) {
      console.error('Failed to upgrade:', error)
      toast.error(t('common.error'))
    }
  }

  const plans = [
    {
      name: 'Free',
      price: '€0',
      period: '',
      features: [
        'Track up to 3 assets',
        'Basic sentiment analysis',
        'Daily updates',
        'Email notifications'
      ],
      popular: false,
      plan: 'free' as const
    },
    {
      name: 'Pro',
      price: '€5',
      period: '/month',
      features: [
        'Track unlimited assets',
        'Real-time alerts',
        'Advanced AI analysis',
        'Telegram notifications',
        'Priority support',
        'Custom alert rules',
        'Historical data access'
      ],
      popular: true,
      plan: 'pro' as const
    },
    {
      name: 'Premium',
      price: '€10',
      period: '/month',
      features: [
        'Everything in Pro',
        'White-label options',
        'Custom integrations',
        'Dedicated support',
        'Advanced analytics',
        'Team management',
        'Custom sentiment models',
        'Priority data access',
        'API access',
        'Advanced charting tools'
      ],
      popular: false,
      plan: 'premium' as const
    }
  ]

  const getCurrentPlan = () => {
    if (!currentSubscription) return 'free'
    return currentSubscription.plan
  }

  const isPlanActive = (plan: string) => {
    return getCurrentPlan() === plan
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white dark:text-white light:text-gray-900 mb-2">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-6">
            {t('auth.signInToView')}
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <Crown className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white dark:text-white light:text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-400 dark:text-gray-400 light:text-gray-600 max-w-3xl mx-auto">
          Unlock the full power of AI-driven market sentiment analysis
        </p>
      </div>

      {/* Current Plan Status */}
      {currentSubscription && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Star className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
                  Current Plan: {currentSubscription.plan.toUpperCase()}
                </h3>
                <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-sm">
                  {currentSubscription.status === 'active' ? 'Active' : 'Inactive'}
                  {currentSubscription.endDate && ` • Expires: ${new Date(currentSubscription.endDate).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            {currentSubscription.promoCode && (
              <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                Promo: {currentSubscription.promoCode}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Promo Code Section */}
      <div className="bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Gift className="w-6 h-6 text-purple-500" />
            <h3 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
              Have a promo code?
            </h3>
          </div>
          <button
            onClick={() => setShowPromoInput(!showPromoInput)}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Enter Code
          </button>
        </div>
        
        {showPromoInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 flex space-x-3"
          >
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code..."
              className="flex-1 px-4 py-2 bg-gray-800 dark:bg-gray-800 light:bg-gray-100 border border-gray-700 dark:border-gray-700 light:border-gray-300 rounded-lg text-white dark:text-white light:text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handlePromoCode}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Apply Code
            </button>
          </motion.div>
        )}
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-gray-900 dark:bg-gray-900 light:bg-white rounded-xl border p-8 transition-all duration-300 ${
              plan.popular
                ? 'border-blue-500 scale-105 shadow-2xl shadow-blue-500/20'
                : 'border-gray-800 dark:border-gray-800 light:border-gray-200 hover:border-gray-700 dark:hover:border-gray-700 light:hover:border-gray-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white dark:text-white light:text-gray-900 mb-2">
                {plan.name}
              </h3>
              <div className="text-4xl font-bold text-white dark:text-white light:text-gray-900 mb-1">
                {plan.price}
                <span className="text-lg text-gray-400 dark:text-gray-400 light:text-gray-600">
                  {plan.period}
                </span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300 dark:text-gray-300 light:text-gray-700">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                if (plan.plan === 'free') return
                handleUpgrade(plan.plan)
              }}
              disabled={isPlanActive(plan.plan)}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                isPlanActive(plan.plan)
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : plan.popular
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                  : 'bg-gray-800 dark:bg-gray-800 light:bg-gray-200 hover:bg-gray-700 dark:hover:bg-gray-700 light:hover:bg-gray-300 text-white dark:text-white light:text-gray-900'
              }`}
            >
              {isPlanActive(plan.plan)
                ? 'Current Plan'
                : plan.plan === 'free'
                ? 'Free'
                : 'Upgrade Now'
              }
            </button>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <p className="text-gray-400 dark:text-gray-400 light:text-gray-600">
          All plans include a 7-day free trial. Cancel anytime. No hidden fees.
        </p>
      </div>
    </div>
  )
}
