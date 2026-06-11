import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Simple data-fetching hook with loading/error states.
 * Re-fetches whenever `deps` change.
 */
export function useQuery(fetchFn, deps = [], options = {}) {
  const { immediate = true, initialData = null } = options
  const [data,    setData]    = useState(initialData)
  const [loading, setLoading] = useState(immediate)
  const [error,   setError]   = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchFn()
      if (mountedRef.current) setData(res.data?.data ?? res.data)
    } catch (err) {
      if (mountedRef.current)
        setError(err.response?.data?.message || err.message || 'Something went wrong')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (immediate) execute()
  }, [execute]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: execute }
}

/**
 * Mutation hook for POST / PATCH / DELETE operations.
 */
export function useMutation(mutateFn) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const mutate = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const res = await mutateFn(...args)
      return { success: true, data: res.data?.data ?? res.data }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Operation failed'
      const errors  = err.response?.data?.errors  || []
      setError(message)
      return { success: false, message, errors }
    } finally {
      setLoading(false)
    }
  }, [mutateFn])

  return { mutate, loading, error, clearError: () => setError(null) }
}
