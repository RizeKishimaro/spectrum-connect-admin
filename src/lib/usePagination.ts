// Pagination Hook: usePagination.ts
import { useEffect, useState } from "react"
import axiosClient from "@/lib/axiosClient"

interface PaginationOptions {
  route: string
  fields?: Record<string, any>
  limit?: number
  search?: string
  include?: string[]
}

export function usePagination<T = any>({ route, fields = {}, limit = 10, search = "", include = [] }: PaginationOptions) {
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get(route, {
        params: {
          ...fields,
          take: limit,
          skip: (page - 1) * limit,
          search,
          include: include.join(",")
        }
      })
      setData(res.data.data)
      setTotal(res.data.total)
    } catch (err) {
      console.error("Failed to fetch paginated data, nyan~ 🐾", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, limit, search])

  return {
    data,
    total,
    page,
    setPage,
    loading,
    totalPages: Math.ceil(total / limit)
  }
}
