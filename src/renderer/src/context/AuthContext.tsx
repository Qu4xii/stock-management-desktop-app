// File: src/renderer/src/contexts/AuthContext.tsx

import { createContext, useState, useContext, ReactNode } from 'react'
import { StaffMember } from '../types'

interface AuthContextType {
  currentUser: StaffMember | null
  isLoading: boolean
  logIn: (credentials: { email: string; password: string }) => Promise<void>
  signUp: (data: Pick<StaffMember, 'name' | 'email' | 'phone'> & { password: string }) => Promise<void>
  logOut: () => Promise<void> // Changed to Promise
  updateCurrentUser: (user: StaffMember) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const logIn = async (credentials: { email: string; password: string }) => {
    setIsLoading(true)
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required.')
      }
      const user = await window.db.logIn(credentials)
      if (user) {
        setCurrentUser(user)
      } else {
        throw new Error('Invalid email or password.')
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (data: Pick<StaffMember, 'name' | 'email' | 'phone'> & { password: string }) => {
    setIsLoading(true)
    try {
      if (!data.name || !data.email || !data.password) {
        throw new Error('Name, email, and password are required.')
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        throw new Error('Please enter a valid email address.')
      }
      if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters long.')
      }
      const newUser = await window.db.signUp(data)
      if (newUser) {
        setCurrentUser(newUser)
      } else {
        throw new Error('Failed to create account. Please try again.')
      }
    } catch (error: any) {
      throw new Error(error.message || 'Account creation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // [SECURITY] Updated logOut function
  const logOut = async () => {
    try {
      // Call the backend IPC handler to clear the secure session
      await window.db.logOut()
      console.log('Backend session cleared.')
    } catch (error) {
      console.error('Failed to log out on the backend:', error)
      // We still clear the frontend state even if the backend call fails
    } finally {
      setCurrentUser(null)
    }
  }

  const updateCurrentUser = (user: StaffMember) => {
    setCurrentUser(user)
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        logIn,
        signUp,
        logOut,
        updateCurrentUser
      }}
    >
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