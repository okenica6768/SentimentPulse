
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { useTheme } from './hooks/useTheme'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Analysis from './pages/Analysis'
import Alerts from './pages/Alerts'
import Subscription from './pages/Subscription'
import Settings from './pages/Settings'

function AppContent() {
  const { theme } = useTheme()

  useEffect(() => {
    // Apply theme class to document root with proper cleanup
    const root = document.documentElement
    
    // Remove all theme classes first
    root.classList.remove('dark', 'light')
    
    // Apply the current theme
    root.classList.add(theme)
    
    // Also apply to body for better coverage
    document.body.classList.remove('dark', 'light')
    document.body.classList.add(theme)
    
    console.log(`Theme applied: ${theme}`)
  }, [theme])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
    }`}>
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analysis/:symbol?" element={<Analysis />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#374151' : '#ffffff',
            color: theme === 'dark' ? '#fff' : '#000',
            border: theme === 'dark' ? '1px solid #4B5563' : '1px solid #e5e7eb'
          }
        }}
      />
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
