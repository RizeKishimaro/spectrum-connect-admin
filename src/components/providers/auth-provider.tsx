
"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authService } from "@/lib/auth-service"

interface User {
  id: string
  email: string
  roles: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const publicRoutes = ["/login"]
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    const initAuth = () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getUser()
          setUser(userData)
        } else {
          authService.clearAuth()
          setUser(null)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        authService.clearAuth()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [pathname])

  // Redirect logic (safely outside render!)
  useEffect(() => {
    if (!isLoading) {
      if (!user && !isPublicRoute) {
        router.push("/login")
      } else if (user && isPublicRoute) {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, isPublicRoute, router])

  const login = (token: string, userData: User) => {
    authService.setAuth(token, userData)
    setUser(userData)
    router.push("/dashboard")
  }

  const logout = () => {
    authService.clearAuth()
    setUser(null)
    router.push("/login")
  }

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role)
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return authService.hasAnyRole(roles)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    hasAnyRole,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

