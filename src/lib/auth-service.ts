"use client"

interface User {
  id: string
  email: string
  roles: string
  [key: string]: any
}

class AuthService {
  private readonly TOKEN_KEY = "token"
  private readonly USER_KEY = "user"
  private readonly REFRESH_TOKEN_KEY = "refresh_token"

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false
    const token = this.getToken()
    return !!token && !this.isTokenExpired(token)
  }

  // Get stored token
  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.TOKEN_KEY)
  }

  // Get stored user
  getUser(): User | null {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem(this.USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  // Set authentication data
  setAuth(token: string, user: User, refreshToken?: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.TOKEN_KEY, token)
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
    }
  }

  // Clear authentication data
  clearAuth(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  // Check if token is expired
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch {
      return true
    }
  }

  // Check if user has required role
  hasRole(requiredRole: string): boolean {
    const user = this.getUser()
    if (!user) return false
    return user.roles === requiredRole || user.roles === "admin"
  }

  // Check if user has any of the required roles
  hasAnyRole(requiredRoles: string[]): boolean {
    const user = this.getUser()
    if (!user) return false
    return requiredRoles.includes(user.roles) || user.roles === "admin"
  }
}

export const authService = new AuthService()

