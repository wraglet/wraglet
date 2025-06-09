'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchResponse, SearchResultItem } from '@/interfaces'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

import Avatar from '@/components/Avatar'

interface SearchBarProps {
  placeholder?: string
  className?: string
}

const SearchBar = ({
  placeholder = 'Search Wraglet...',
  className
}: SearchBarProps) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Debounced search function
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 1) {
      setResults([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`
      )
      const data: SearchResponse = await response.json()

      if (data.success) {
        setResults(data.results)
        setShowSuggestions(true)
        setSelectedIndex(-1)
      } else {
        setResults([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle input change with debouncing
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout for debounced search (3 seconds as requested)
      timeoutRef.current = setTimeout(() => {
        debouncedSearch(value)
      }, 3000)
    },
    [debouncedSearch]
  )

  // Handle result click
  const handleResultClick = useCallback(
    (result: SearchResultItem) => {
      router.push(result.url)
      setQuery('')
      setShowSuggestions(false)
      setSelectedIndex(-1)
      inputRef.current?.blur()
    },
    [router]
  )

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions || results.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex])
          } else if (query.trim()) {
            // Navigate to search results page
            router.push(`/search?q=${encodeURIComponent(query)}`)
            setShowSuggestions(false)
          }
          break
        case 'Escape':
          setShowSuggestions(false)
          setSelectedIndex(-1)
          inputRef.current?.blur()
          break
      }
    },
    [showSuggestions, results, selectedIndex, query, router, handleResultClick]
  )

  // Handle clear search
  const handleClear = useCallback(() => {
    setQuery('')
    setResults([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }, [])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return '👤'
      case 'post':
        return '📝'
      case 'blog':
        return '📖'
      case 'video':
        return '🎥'
      default:
        return '🔍'
    }
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setShowSuggestions(true)
            }
          }}
          className="h-[30px] w-full rounded-2xl border border-solid border-[#E5E5E5] bg-[#E7ECF0] pr-10 pl-10 text-sm text-[#333333] focus:ring-2 focus:ring-blue-300 focus:outline-hidden [&::-webkit-search-cancel-button]:hidden"
          placeholder={placeholder}
          autoComplete="off"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-[70vh] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg md:max-h-96">
          {results.length === 0 && !isLoading && query.trim() && (
            <div className="px-3 py-3 text-sm text-gray-500 md:px-4">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {results.map((result, index) => (
            <div
              key={result._id}
              onClick={() => handleResultClick(result)}
              className={`flex cursor-pointer items-center gap-2 px-3 py-3 transition-colors hover:bg-gray-50 md:gap-3 md:px-4 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex-shrink-0">
                {result.avatar ? (
                  <Avatar
                    src={result.avatar || null}
                    size="h-7 w-7 md:h-8 md:w-8"
                    gender="Male"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs md:h-8 md:w-8 md:text-sm">
                    {getTypeIcon(result.type)}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-900">
                  {result.title}
                </div>
                {result.subtitle && (
                  <div className="truncate text-xs text-gray-500">
                    {result.subtitle}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 capitalize md:px-2 md:py-1">
                  {result.type}
                </span>
              </div>
            </div>
          ))}

          {query.trim() && (
            <div
              onClick={() => {
                router.push(`/search?q=${encodeURIComponent(query)}`)
                setShowSuggestions(false)
              }}
              className="cursor-pointer border-t border-gray-200 px-3 py-3 text-sm text-blue-600 hover:bg-gray-50 md:px-4"
            >
              Search for &quot;{query}&quot; →
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
