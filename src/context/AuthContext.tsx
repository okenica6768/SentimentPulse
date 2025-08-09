
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { lumi } from '../lib/lumi'

interface User {
  userId: string
  email: string
  userName: string
  createdTime: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  signIn: () => Promise<void>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const currentUser = lumi.auth.user
    const authStatus = lumi.auth.isAuthenticated

    setUser(currentUser)
    setIsAuthenticated(authStatus)
    setLoading(false)

    // Listen for auth changes
    const unsubscribe = lumi.auth.onAuthChange(({ isAuthenticated, user }) => {
      setIsAuthenticated(isAuthenticated)
      setUser(user)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async () => {
    try {
      const { user } = await lumi.auth.signIn()
      setUser(user)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  }

  const signOut = () => {
    lumi.auth.signOut()
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
