import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Paginated data-fetching hook.
 * `fetchFn` receives { page, limit, search, ...filters } and should return
 * the axios response.
 */
export function usePagination(fetchFn, initialFilters = {}, options = {}) {
  const { limit: defaultLimit = 10 } = options

  const [data,       setData]       = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [page,       setPage]       = useState(1)
  const [search,     setSearch]     = useState('')
  const [filters,    setFilters]    = useState(initialFilters)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchFn({ page, limit: defaultLimit, search: search || undefined, ...filters })
      if (!mountedRef.current) return
      const d = res.data?.data
      setData(d?.data ?? [])
      setPagination(d?.pagination ?? { total: 0, page: 1, pages: 1 })
    } catch (err) {
      if (mountedRef.current)
        setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [page, search, filters, fetchFn, defaultLimit])

  useEffect(() => { fetch() }, [fetch])

  const goToPage   = useCallback((p) => setPage(p), [])
  const applySearch  = useCallback((s) => { setSearch(s); setPage(1) }, [])
  const applyFilters = useCallback((f) => { setFilters((prev) => ({ ...prev, ...f })); setPage(1) }, [])
  const resetFilters = useCallback(() => { setFilters(initialFilters); setSearch(''); setPage(1) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data, pagination, loading, error,
    page, search, filters,
    goToPage, applySearch, applyFilters, resetFilters,
    refetch: fetch,
  }
}
