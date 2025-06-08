
"use client"

import { useEffect, useState } from "react"
import axiosClient from "@/lib/axiosClient"
import { cacheService } from "@/lib/cache-service"

interface PaginationOptions {
  route: string
  fields?: Record<string, any>
  limit?: number
  search?: string
  include?: string[]
  cacheKey?: string
  cacheTTL?: number
}

interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  setPage: (page: number) => void
  loading: boolean
  error: string | null
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  refresh: () => void
  setSearch: (search: string) => void
  setLimit: (limit: number) => void
}

export function usePagination<T = any>({
  route,
  fields = {},
  limit = 10,
  search = "",
  include = [],
  cacheKey,
  cacheTTL = 5 * 60 * 1000, // 5 minutes
}: PaginationOptions): PaginationResult<T> {
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState(search)
  const [pageLimit, setPageLimit] = useState(limit)

  const generateCacheKey = () => {
    const baseKey = cacheKey || route
    return `${baseKey}_${page}_${pageLimit}_${searchTerm}_${JSON.stringify(fields)}_${include.join(",")}`
  }

  const fetchData = async (useCache = true) => {
    setLoading(true)
    setError(null)

    try {
      const key = generateCacheKey()

      // Try to get from cache first
      if (useCache) {
        const cachedData = cacheService.get<{ data: T[]; total: number }>(key)
        if (cachedData) {
          setData(cachedData.data)
          setTotal(cachedData.total)
          setLoading(false)
          return
        }
      }

      const res = await axiosClient.get(route, {
        params: {
          ...fields,
          take: pageLimit,
          skip: (page - 1) * pageLimit,
          search: searchTerm,
          include: include.join(","),
        },
      })

      const responseData = {
        data: res.data.data || res.data,
        total: res.data.total || res.data.length || 0,
      }

      // Cache the response
      cacheService.set(key, responseData, cacheTTL)

      setData(responseData.data)
      setTotal(responseData.total)
    } catch (err: any) {
      console.error("Failed to fetch paginated data:", err)
      setError(err.response?.data?.message || err.message || "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    // Invalidate cache and refetch
    const pattern = cacheKey || route
    cacheService.invalidatePattern(pattern)
    fetchData(false)
  }

  const handleSetSearch = (newSearch: string) => {
    setSearchTerm(newSearch)
    setPage(1) // Reset to first page when searching
  }

  const handleSetLimit = (newLimit: number) => {
    setPageLimit(newLimit)
    setPage(1) // Reset to first page when changing limit
  }

  useEffect(() => {
    fetchData()
  }, [page, pageLimit, searchTerm])

  const totalPages = Math.ceil(total / pageLimit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return {
    data,
    total,
    page,
    setPage,
    loading,
    error,
    totalPages,
    hasNextPage,
    hasPrevPage,
    refresh,
    setSearch: handleSetSearch,
    setLimit: handleSetLimit,
  }
}

