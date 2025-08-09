
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'sk'

interface Translations {
  [key: string]: {
    en: string
    sk: string
  }
}

const translations: Translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', sk: 'Prehľad' },
  'nav.analysis': { en: 'Analysis', sk: 'Analýza' },
  'nav.alerts': { en: 'Alerts', sk: 'Upozornenia' },
  'nav.subscription': { en: 'Subscription', sk: 'Predplatné' },
  'nav.settings': { en: 'Settings', sk: 'Nastavenia' },
  'nav.signIn': { en: 'Sign In', sk: 'Prihlásiť sa' },
  'nav.signOut': { en: 'Sign Out', sk: 'Odhlásiť sa' },
  
  // Dashboard
  'dashboard.title': { en: 'Market Sentiment Dashboard', sk: 'Prehľad nálady trhu' },
  'dashboard.subtitle': { en: 'Track real-time sentiment and predictions for your favorite assets', sk: 'Sledujte náladu a predpovede vašich obľúbených aktív v reálnom čase' },
  'dashboard.addAsset': { en: 'Add Asset', sk: 'Pridať aktívum' },
  'dashboard.searchPlaceholder': { en: 'Search stocks or crypto...', sk: 'Hľadať akcie alebo krypto...' },
  'dashboard.noAssets': { en: 'No tracked assets yet', sk: 'Zatiaľ žiadne sledované aktíva' },
  'dashboard.startTracking': { en: 'Start tracking your first asset to see sentiment analysis and predictions.', sk: 'Začnite sledovať svoje prvé aktívum a uvidíte analýzu nálady a predpovede.' },
  'dashboard.totalAssets': { en: 'Total Assets', sk: 'Celkové aktíva' },
  'dashboard.positiveSignals': { en: 'Positive Signals', sk: 'Pozitívne signály' },
  'dashboard.averageConfidence': { en: 'Average Confidence', sk: 'Priemerná spoľahlivosť' },
  'dashboard.recentAlerts': { en: 'Recent Alerts', sk: 'Najnovšie upozornenia' },
  'dashboard.marketOverview': { en: 'Market Overview', sk: 'Prehľad trhu' },
  'dashboard.topMovers': { en: 'Top Movers', sk: 'Najväčšie pohyby' },
  'dashboard.sentimentTrends': { en: 'Sentiment Trends', sk: 'Trendy nálady' },
  
  // Settings
  'settings.title': { en: 'Settings', sk: 'Nastavenia' },
  'settings.subtitle': { en: 'Manage your account preferences and application settings', sk: 'Spravujte nastavenia účtu a aplikácie' },
  'settings.appearance': { en: 'Appearance', sk: 'Vzhľad' },
  'settings.language': { en: 'Language', sk: 'Jazyk' },
  'settings.languageDesc': { en: 'Choose your preferred language', sk: 'Vyberte si preferovaný jazyk' },
  'settings.english': { en: 'English', sk: 'Angličtina' },
  'settings.slovak': { en: 'Slovak', sk: 'Slovenčina' },
  'settings.notifications': { en: 'Notifications', sk: 'Upozornenia' },
  'settings.notificationsDesc': { en: 'Configure your notification preferences', sk: 'Nakonfigurujte nastavenia upozornení' },
  'settings.emailNotifications': { en: 'Email Notifications', sk: 'E-mailové upozornenia' },
  'settings.pushNotifications': { en: 'Push Notifications', sk: 'Push upozornenia' },
  'settings.account': { en: 'Account', sk: 'Účet' },
  'settings.accountDesc': { en: 'Manage your account information', sk: 'Spravujte informácie o účte' },
  'settings.privacy': { en: 'Privacy', sk: 'Súkromie' },
  'settings.privacyDesc': { en: 'Your data privacy and security settings', sk: 'Nastavenia súkromia a bezpečnosti dát' },
  'settings.support': { en: 'Support', sk: 'Podpora' },
  'settings.supportDesc': { en: 'Get help and contact our support team', sk: 'Získajte pomoc a kontaktujte náš tím podpory' },
  'settings.viewPrivacyPolicy': { en: 'View Privacy Policy →', sk: 'Zobraziť zásady súkromia →' },
  'settings.contactSupport': { en: 'Contact Support →', sk: 'Kontaktovať podporu →' },
  'settings.theme': { en: 'Theme', sk: 'Téma' },
  'settings.themeDesc': { en: 'Choose your preferred theme', sk: 'Vyberte si preferovanú tému' },
  'settings.lightMode': { en: 'Light Mode', sk: 'Svetlý režim' },
  'settings.darkMode': { en: 'Dark Mode', sk: 'Tmavý režim' },
  
  // Asset Card
  'asset.track': { en: 'Track', sk: 'Sledovať' },
  'asset.untrack': { en: 'Untrack', sk: 'Prestať sledovať' },
  'asset.viewAnalysis': { en: 'View Analysis', sk: 'Zobraziť analýzu' },
  'asset.sentiment': { en: 'Sentiment', sk: 'Nálada' },
  'asset.prediction': { en: 'Prediction', sk: 'Predpoveď' },
  'asset.confidence': { en: 'Confidence', sk: 'Spoľahlivosť' },
  'asset.growth': { en: 'Growth', sk: 'Rast' },
  'asset.drop': { en: 'Drop', sk: 'Pokles' },
  'asset.price': { en: 'Price', sk: 'Cena' },
  'asset.currentPrice': { en: 'Current Price', sk: 'Aktuálna cena' },
  'asset.change': { en: 'Change', sk: 'Zmena' },
  'asset.volume': { en: 'Volume', sk: 'Objem' },
  'asset.volume24h': { en: '24h Volume', sk: '24h objem' },
  'asset.marketCap': { en: 'Market Cap', sk: 'Trhová kapitalizácia' },
  'asset.lastUpdate': { en: 'Last Update', sk: 'Posledná aktualizácia' },
  'asset.lastAnalyzed': { en: 'Last Analyzed', sk: 'Naposledy analyzované' },
  'asset.24h': { en: '24h', sk: '24h' },
  'asset.tradingVolume': { en: 'Trading Volume', sk: 'Objem obchodovania' },
  'asset.totalValue': { en: 'Total Value', sk: 'Celková hodnota' },
  
  // Analysis - Comprehensive translations
  'analysis.title': { en: 'Sentiment Analysis', sk: 'Analýza nálady' },
  'analysis.subtitle': { en: 'Deep dive into market sentiment and AI predictions', sk: 'Hlboká analýza nálady trhu a AI predpovedí' },
  'analysis.overview': { en: 'Overview', sk: 'Prehľad' },
  'analysis.sources': { en: 'Data Sources', sk: 'Zdroje dát' },
  'analysis.timeline': { en: 'Timeline', sk: 'Časová os' },
  'analysis.predictions': { en: 'Predictions', sk: 'Predpovede' },
  'analysis.socialMedia': { en: 'Social Media', sk: 'Sociálne siete' },
  'analysis.news': { en: 'News', sk: 'Správy' },
  'analysis.technicalIndicators': { en: 'Technical Indicators', sk: 'Technické indikátory' },
  'analysis.technicalAnalysis': { en: 'Technical Analysis', sk: 'Technická analýza' },
  'analysis.sentiment24h': { en: '24h Sentiment', sk: '24h nálada' },
  'analysis.sentiment7d': { en: '7d Sentiment', sk: '7d nálada' },
  'analysis.sentiment30d': { en: '30d Sentiment', sk: '30d nálada' },
  'analysis.bullish': { en: 'Bullish', sk: 'Býčí' },
  'analysis.bearish': { en: 'Bearish', sk: 'Medvedí' },
  'analysis.neutral': { en: 'Neutral', sk: 'Neutrálny' },
  'analysis.veryPositive': { en: 'Very Positive', sk: 'Veľmi pozitívny' },
  'analysis.positive': { en: 'Positive', sk: 'Pozitívny' },
  'analysis.negative': { en: 'Negative', sk: 'Negatívny' },
  'analysis.veryNegative': { en: 'Very Negative', sk: 'Veľmi negatívny' },
  'analysis.overbought': { en: 'Overbought', sk: 'Prekúpený' },
  'analysis.oversold': { en: 'Oversold', sk: 'Prepredaný' },
  'analysis.shortTerm': { en: 'Short Term', sk: 'Krátkodobý' },
  'analysis.longTerm': { en: 'Long Term', sk: 'Dlhodobý' },
  
  // AI Analysis - New detailed translations
  'analysis.aiReasoning': { en: 'AI Analysis Reasoning', sk: 'Odôvodnenie AI analýzy' },
  'analysis.bullishFactors': { en: 'Bullish Factors', sk: 'Býčie faktory' },
  'analysis.bearishFactors': { en: 'Bearish Factors', sk: 'Medvedie faktory' },
  'analysis.priceMovement': { en: 'Price Movement', sk: 'Pohyb ceny' },
  'analysis.marketSentiment': { en: 'Market Sentiment', sk: 'Nálada trhu' },
  'analysis.tradingVolume': { en: 'Trading Volume', sk: 'Objem obchodovania' },
  'analysis.socialSentiment': { en: 'Social Sentiment', sk: 'Sociálna nálada' },
  'analysis.strongUpwardMomentum': { en: 'Strong upward momentum with significant price gains', sk: 'Silný vzostupný momentum so značnými cenovými ziskami' },
  'analysis.significantDecline': { en: 'Significant price decline indicating bearish pressure', sk: 'Významný pokles ceny naznačujúci medvedí tlak' },
  'analysis.overwhelminglyPositive': { en: 'Overwhelmingly positive market sentiment from multiple sources', sk: 'Prevažne pozitívna nálada trhu z viacerých zdrojov' },
  'analysis.negativeMarketSentiment': { en: 'Negative market sentiment indicating investor concern', sk: 'Negatívna nálada trhu naznačujúca obavy investorov' },
  'analysis.overboughtCondition': { en: 'Overbought condition suggests potential price correction', sk: 'Prekúpený stav naznačuje možnú korekciu ceny' },
  'analysis.oversoldCondition': { en: 'Oversold condition indicates potential buying opportunity', sk: 'Prepredaný stav naznačuje možnú príležitosť na nákup' },
  'analysis.highTradingActivity': { en: 'High trading activity shows strong market interest', sk: 'Vysoká obchodná aktivita ukazuje silný záujem trhu' },
  'analysis.positiveSocialBuzz': { en: 'Positive social media buzz and community sentiment', sk: 'Pozitívny rozruch na sociálnych sieťach a nálada komunity' },
  'analysis.highImpact': { en: 'High Impact', sk: 'Vysoký dopad' },
  'analysis.mediumImpact': { en: 'Medium Impact', sk: 'Stredný dopad' },
  'analysis.lowImpact': { en: 'Low Impact', sk: 'Nízky dopad' },
  'analysis.noBullishFactors': { en: 'No significant bullish factors detected', sk: 'Nezistili sa žiadne významné býčie faktory' },
  'analysis.noBearishFactors': { en: 'No significant bearish factors detected', sk: 'Nezistili sa žiadne významné medvedie faktory' },
  'analysis.overallAssessment': { en: 'Overall Assessment', sk: 'Celkové hodnotenie' },
  'analysis.positiveOutlook': { en: 'Based on current analysis, the outlook appears positive with favorable market conditions.', sk: 'Na základe aktuálnej analýzy sa výhľad javí pozitívne s priaznivými trhovými podmienkami.' },
  'analysis.negativeOutlook': { en: 'Current analysis suggests a negative outlook with challenging market conditions.', sk: 'Aktuálna analýza naznačuje negatívny výhľad s náročnými trhovými podmienkami.' },
  'analysis.neutralOutlook': { en: 'The analysis indicates a neutral outlook with mixed market signals.', sk: 'Analýza naznačuje neutrálny výhľad so zmiešanými trhovými signálmi.' },
  'analysis.confidenceLevel': { en: 'Confidence Level', sk: 'Úroveň spoľahlivosti' },
  'analysis.predictionAnalysis': { en: 'AI Prediction Analysis', sk: 'AI predikčná analýza' },
  'analysis.growthProbability': { en: 'Growth Probability', sk: 'Pravdepodobnosť rastu' },
  'analysis.nextWeek': { en: 'Next 7 days', sk: 'Nasledujúcich 7 dní' },
  'analysis.modelAccuracy': { en: 'Model accuracy', sk: 'Presnosť modelu' },
  'analysis.riskLevel': { en: 'Risk Level', sk: 'Úroveň rizika' },
  'analysis.investmentRisk': { en: 'Investment risk', sk: 'Investičné riziko' },
  'analysis.risk': { en: 'Risk', sk: 'Riziko' },
  'analysis.high': { en: 'High', sk: 'Vysoké' },
  'analysis.medium': { en: 'Medium', sk: 'Stredné' },
  'analysis.low': { en: 'Low', sk: 'Nízke' },
  'analysis.latestNews': { en: 'Latest News', sk: 'Najnovšie správy' },
  'analysis.twitterMentions': { en: 'Twitter Mentions', sk: 'Zmienky na Twitteri' },
  'analysis.redditPosts': { en: 'Reddit Posts', sk: 'Príspevky na Reddit' },
  'analysis.socialScore': { en: 'Social Score', sk: 'Sociálne skóre' },
  
  // Subscription
  'subscription.title': { en: 'Choose Your Plan', sk: 'Vyberte si svoj plán' },
  'subscription.subtitle': { en: 'Unlock the full power of AI-driven market sentiment analysis', sk: 'Odomknite plnú silu analýzy nálady trhu pomocou AI' },
  'subscription.currentPlan': { en: 'Current Plan', sk: 'Aktuálny plán' },
  'subscription.free': { en: 'Free', sk: 'Zadarmo' },
  'subscription.pro': { en: 'Pro', sk: 'Pro' },
  'subscription.enterprise': { en: 'Enterprise', sk: 'Enterprise' },
  'subscription.upgradeNow': { en: 'Upgrade Now', sk: 'Upgradovať teraz' },
  'subscription.currentPlanButton': { en: 'Current Plan', sk: 'Aktuálny plán' },
  'subscription.getStarted': { en: 'Get Started', sk: 'Začať' },
  'subscription.promoCode': { en: 'Have a promo code?', sk: 'Máte promo kód?' },
  'subscription.enterCode': { en: 'Enter Code', sk: 'Zadať kód' },
  'subscription.codePlaceholder': { en: 'Enter promo code...', sk: 'Zadajte promo kód...' },
  'subscription.applyCode': { en: 'Apply Code', sk: 'Použiť kód' },
  'subscription.codeSuccess': { en: 'Promo code applied! You now have Pro access.', sk: 'Promo kód bol použitý! Teraz máte Pro prístup.' },
  'subscription.codeError': { en: 'Invalid promo code. Please try again.', sk: 'Neplatný promo kód. Skúste to znova.' },
  
  // Subscription Features
  'subscription.feature.trackAssets': { en: 'Track unlimited assets', sk: 'Sledovať neobmedzené množstvo aktív' },
  'subscription.feature.realTimeAlerts': { en: 'Real-time alerts', sk: 'Upozornenia v reálnom čase' },
  'subscription.feature.advancedAnalysis': { en: 'Advanced AI analysis', sk: 'Pokročilá AI analýza' },
  'subscription.feature.telegramNotifications': { en: 'Telegram notifications', sk: 'Telegram upozornenia' },
  'subscription.feature.prioritySupport': { en: 'Priority support', sk: 'Prioritná podpora' },
  'subscription.feature.customAlerts': { en: 'Custom alert rules', sk: 'Vlastné pravidlá upozornení' },
  'subscription.feature.historicalData': { en: 'Historical data access', sk: 'Prístup k historickým dátam' },
  'subscription.feature.apiAccess': { en: 'API access', sk: 'Prístup k API' },
  'subscription.feature.whiteLabel': { en: 'White-label options', sk: 'White-label možnosti' },
  'subscription.feature.customIntegrations': { en: 'Custom integrations', sk: 'Vlastné integrácie' },
  'subscription.feature.dedicatedSupport': { en: 'Dedicated support', sk: 'Dedikovaná podpora' },
  'subscription.feature.advancedAnalytics': { en: 'Advanced analytics', sk: 'Pokročilé analytiky' },
  'subscription.feature.teamManagement': { en: 'Team management', sk: 'Správa tímu' },
  
  // Search Modal
  'search.title': { en: 'Search Assets', sk: 'Hľadať aktíva' },
  'search.placeholder': { en: 'Search for stocks, crypto, or indices...', sk: 'Hľadať akcie, krypto alebo indexy...' },
  'search.popular': { en: 'Popular Assets', sk: 'Populárne aktíva' },
  'search.recent': { en: 'Recently Added', sk: 'Nedávno pridané' },
  'search.noResults': { en: 'No results found', sk: 'Nenašli sa žiadne výsledky' },
  'search.tryDifferent': { en: 'Try searching for a different asset', sk: 'Skúste hľadať iné aktívum' },
  
  // Common
  'common.loading': { en: 'Loading...', sk: 'Načítava...' },
  'common.error': { en: 'Error', sk: 'Chyba' },
  'common.success': { en: 'Success', sk: 'Úspech' },
  'common.cancel': { en: 'Cancel', sk: 'Zrušiť' },
  'common.save': { en: 'Save', sk: 'Uložiť' },
  'common.close': { en: 'Close', sk: 'Zavrieť' },
  'common.edit': { en: 'Edit', sk: 'Upraviť' },
  'common.delete': { en: 'Delete', sk: 'Zmazať' },
  'common.confirm': { en: 'Confirm', sk: 'Potvrdiť' },
  'common.back': { en: 'Back', sk: 'Späť' },
  'common.next': { en: 'Next', sk: 'Ďalej' },
  'common.previous': { en: 'Previous', sk: 'Predchádzajúce' },
  'common.search': { en: 'Search', sk: 'Hľadať' },
  'common.filter': { en: 'Filter', sk: 'Filter' },
  'common.sort': { en: 'Sort', sk: 'Zoradiť' },
  'common.view': { en: 'View', sk: 'Zobraziť' },
  'common.download': { en: 'Download', sk: 'Stiahnuť' },
  'common.export': { en: 'Export', sk: 'Exportovať' },
  'common.import': { en: 'Import', sk: 'Importovať' },
  'common.refresh': { en: 'Refresh', sk: 'Obnoviť' },
  'common.reset': { en: 'Reset', sk: 'Resetovať' },
  'common.apply': { en: 'Apply', sk: 'Použiť' },
  'common.clear': { en: 'Clear', sk: 'Vymazať' },
  'common.select': { en: 'Select', sk: 'Vybrať' },
  'common.upload': { en: 'Upload', sk: 'Nahrať' },
  'common.copy': { en: 'Copy', sk: 'Kopírovať' },
  'common.paste': { en: 'Paste', sk: 'Vložiť' },
  'common.cut': { en: 'Cut', sk: 'Vystrihnúť' },
  'common.undo': { en: 'Undo', sk: 'Späť' },
  'common.redo': { en: 'Redo', sk: 'Znovu' },
  'common.yes': { en: 'Yes', sk: 'Áno' },
  'common.no': { en: 'No', sk: 'Nie' },
  'common.ok': { en: 'OK', sk: 'OK' },
  'common.all': { en: 'All', sk: 'Všetko' },
  'common.none': { en: 'None', sk: 'Žiadne' },
  'common.other': { en: 'Other', sk: 'Iné' },
  'common.unknown': { en: 'Unknown', sk: 'Neznáme' },
  'common.notAvailable': { en: 'Not Available', sk: 'Nie je k dispozícii' },
  'common.comingSoon': { en: 'Coming Soon', sk: 'Už čoskoro' },
  'common.beta': { en: 'Beta', sk: 'Beta' },
  'common.new': { en: 'New', sk: 'Nové' },
  'common.updated': { en: 'Updated', sk: 'Aktualizované' },
  'common.premium': { en: 'Premium', sk: 'Premium' },
  'common.free': { en: 'Free', sk: 'Zadarmo' },
  'common.pro': { en: 'Pro', sk: 'Pro' },
  'common.basic': { en: 'Basic', sk: 'Základný' },
  'common.advanced': { en: 'Advanced', sk: 'Pokročilý' },
  'common.expert': { en: 'Expert', sk: 'Expert' },
  'common.beginner': { en: 'Beginner', sk: 'Začiatočník' },
  'common.intermediate': { en: 'Intermediate', sk: 'Stredne pokročilý' },
  'common.high': { en: 'High', sk: 'Vysoký' },
  'common.medium': { en: 'Medium', sk: 'Stredný' },
  'common.low': { en: 'Low', sk: 'Nízky' },
  'common.enabled': { en: 'Enabled', sk: 'Povolené' },
  'common.disabled': { en: 'Disabled', sk: 'Zakázané' },
  'common.online': { en: 'Online', sk: 'Online' },
  'common.offline': { en: 'Offline', sk: 'Offline' },
  'common.connected': { en: 'Connected', sk: 'Pripojené' },
  'common.disconnected': { en: 'Disconnected', sk: 'Odpojené' },
  'common.synced': { en: 'Synced', sk: 'Synchronizované' },
  'common.syncing': { en: 'Syncing', sk: 'Synchronizuje sa' },
  'common.failed': { en: 'Failed', sk: 'Neúspešné' },
  'common.completed': { en: 'Completed', sk: 'Dokončené' },
  'common.pending': { en: 'Pending', sk: 'Čaká sa' },
  'common.processing': { en: 'Processing', sk: 'Spracováva sa' },
  'common.active': { en: 'Active', sk: 'Aktívne' },
  'common.inactive': { en: 'Inactive', sk: 'Neaktívne' },
  'common.archived': { en: 'Archived', sk: 'Archivované' },
  'common.draft': { en: 'Draft', sk: 'Koncept' },
  'common.published': { en: 'Published', sk: 'Publikované' },
  'common.private': { en: 'Private', sk: 'Súkromné' },
  'common.public': { en: 'Public', sk: 'Verejné' },
  'common.shared': { en: 'Shared', sk: 'Zdieľané' },
  'common.favorite': { en: 'Favorite', sk: 'Obľúbené' },
  'common.bookmark': { en: 'Bookmark', sk: 'Záložka' },
  'common.like': { en: 'Like', sk: 'Páči sa mi' },
  'common.dislike': { en: 'Dislike', sk: 'Nepáči sa mi' },
  'common.follow': { en: 'Follow', sk: 'Sledovať' },
  'common.unfollow': { en: 'Unfollow', sk: 'Prestať sledovať' },
  'common.subscribe': { en: 'Subscribe', sk: 'Odoberať' },
  'common.unsubscribe': { en: 'Unsubscribe', sk: 'Prestať odoberať' },
  'common.notify': { en: 'Notify', sk: 'Upozorniť' },
  'common.mute': { en: 'Mute', sk: 'Stlmiť' },
  'common.unmute': { en: 'Unmute', sk: 'Zrušiť stlmenie' },
  'common.block': { en: 'Block', sk: 'Zablokovať' },
  'common.unblock': { en: 'Unblock', sk: 'Odblokovať' },
  'common.report': { en: 'Report', sk: 'Nahlásiť' },
  'common.share': { en: 'Share', sk: 'Zdieľať' },
  'common.embed': { en: 'Embed', sk: 'Vložiť' },
  'common.link': { en: 'Link', sk: 'Odkaz' },
  'common.url': { en: 'URL', sk: 'URL' },
  'common.email': { en: 'Email', sk: 'E-mail' },
  'common.phone': { en: 'Phone', sk: 'Telefón' },
  'common.address': { en: 'Address', sk: 'Adresa' },
  'common.name': { en: 'Name', sk: 'Meno' },
  'common.title': { en: 'Title', sk: 'Názov' },
  'common.description': { en: 'Description', sk: 'Popis' },
  'common.category': { en: 'Category', sk: 'Kategória' },
  'common.tag': { en: 'Tag', sk: 'Značka' },
  'common.type': { en: 'Type', sk: 'Typ' },
  'common.status': { en: 'Status', sk: 'Stav' },
  'common.priority': { en: 'Priority', sk: 'Priorita' },
  'common.date': { en: 'Date', sk: 'Dátum' },
  'common.time': { en: 'Time', sk: 'Čas' },
  'common.duration': { en: 'Duration', sk: 'Trvanie' },
  'common.size': { en: 'Size', sk: 'Veľkosť' },
  'common.quantity': { en: 'Quantity', sk: 'Množstvo' },
  'common.amount': { en: 'Amount', sk: 'Suma' },
  'common.total': { en: 'Total', sk: 'Celkom' },
  'common.subtotal': { en: 'Subtotal', sk: 'Medzisúčet' },
  'common.tax': { en: 'Tax', sk: 'Daň' },
  'common.discount': { en: 'Discount', sk: 'Zľava' },
  'common.shipping': { en: 'Shipping', sk: 'Doprava' },
  'common.currency': { en: 'Currency', sk: 'Mena' },
  'common.language': { en: 'Language', sk: 'Jazyk' },
  'common.country': { en: 'Country', sk: 'Krajina' },
  'common.city': { en: 'City', sk: 'Mesto' },
  'common.region': { en: 'Region', sk: 'Región' },
  'common.timezone': { en: 'Timezone', sk: 'Časové pásmo' },
  'common.results': { en: 'Results', sk: 'Výsledky' },
  
  // Time and Date
  'time.now': { en: 'Now', sk: 'Teraz' },
  'time.justNow': { en: 'Just now', sk: 'Práve teraz' },
  'time.minuteAgo': { en: 'A minute ago', sk: 'Pred minútou' },
  'time.minutesAgo': { en: 'minutes ago', sk: 'pred minútami' },
  'time.hourAgo': { en: 'An hour ago', sk: 'Pred hodinou' },
  'time.hoursAgo': { en: 'hours ago', sk: 'pred hodinami' },
  'time.dayAgo': { en: 'A day ago', sk: 'Pred dňom' },
  'time.daysAgo': { en: 'days ago', sk: 'pred dňami' },
  'time.weekAgo': { en: 'A week ago', sk: 'Pred týždňom' },
  'time.weeksAgo': { en: 'weeks ago', sk: 'pred týždňami' },
  'time.monthAgo': { en: 'A month ago', sk: 'Pred mesiacom' },
  'time.monthsAgo': { en: 'months ago', sk: 'pred mesiacmi' },
  'time.yearAgo': { en: 'A year ago', sk: 'Pred rokom' },
  'time.yearsAgo': { en: 'years ago', sk: 'pred rokmi' },
  
  // Authentication Messages
  'auth.signInRequired': { en: 'Sign in to access this feature', sk: 'Prihláste sa pre prístup k tejto funkcii' },
  'auth.signInToView': { en: 'Sign in to view', sk: 'Prihláste sa pre zobrazenie' },
  'auth.signInToContinue': { en: 'Sign in to continue', sk: 'Prihláste sa pre pokračovanie' },
  'auth.welcomeBack': { en: 'Welcome back!', sk: 'Vitajte späť!' },
  'auth.signInSuccess': { en: 'Successfully signed in', sk: 'Úspešne prihlásený' },
  'auth.signOutSuccess': { en: 'Successfully signed out', sk: 'Úspešne odhlásený' },
  'auth.signInError': { en: 'Sign in failed. Please try again.', sk: 'Prihlásenie zlyhalo. Skúste to znova.' },
  
  // Success Messages
  'success.saved': { en: 'Successfully saved', sk: 'Úspešne uložené' },
  'success.updated': { en: 'Successfully updated', sk: 'Úspešne aktualizované' },
  'success.deleted': { en: 'Successfully deleted', sk: 'Úspešne zmazané' },
  'success.created': { en: 'Successfully created', sk: 'Úspešne vytvorené' },
  'success.sent': { en: 'Successfully sent', sk: 'Úspešne odoslané' },
  'success.uploaded': { en: 'Successfully uploaded', sk: 'Úspešne nahrané' },
  'success.downloaded': { en: 'Successfully downloaded', sk: 'Úspešne stiahnuté' },
  'success.copied': { en: 'Copied to clipboard', sk: 'Skopírované do schránky' },
  'success.subscribed': { en: 'Successfully subscribed', sk: 'Úspešne odoberané' },
  'success.unsubscribed': { en: 'Successfully unsubscribed', sk: 'Úspešne zrušené odberanie' }
}

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('sentimentpulse-language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'sk')) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('sentimentpulse-language', newLanguage)
  }

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
