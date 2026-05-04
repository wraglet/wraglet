'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchResponse, SearchResultItem } from '@/interfaces'
import { cn } from '@/lib/utils'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

import Avatar from '@/components/shared/Avatar'
import Button from '@/components/shared/Button'

interface SearchBarProps {
  placeholder?: string
  className?: string
  variant?: 'default' | 'header'
}

const SearchBar = ({
  placeholder = 'Search Wraglet...',
  className,
  variant = 'default'
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

  const isHeader = variant === 'header'

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      <div className="relative">
        <MagnifyingGlassIcon
          className={cn(
            'pointer-events-none absolute top-1/2 left-2.5 z-10 h-3.5 w-3.5 -translate-y-1/2 sm:left-3 sm:h-4 sm:w-4',
            isHeader ? 'text-white/80' : 'text-gray-400'
          )}
          aria-hidden
        />
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
          className={cn(
            'w-full text-sm focus:outline-none [&::-webkit-search-cancel-button]:hidden',
            isHeader
              ? 'h-8 rounded-full border border-white/25 bg-white/15 py-1.5 pr-9 pl-9 text-xs text-white shadow-inner backdrop-blur-sm placeholder:text-white/65 focus:border-white/45 focus:bg-white/25 focus:ring-2 focus:ring-white/35 sm:h-9 sm:py-2 sm:pr-10 sm:pl-10 sm:text-sm'
              : 'h-[30px] rounded-2xl border border-solid border-[#E5E5E5] bg-[#E7ECF0] pr-10 pl-10 text-[#333333] focus:ring-2 focus:ring-blue-300'
          )}
          placeholder={placeholder}
          autoComplete="off"
        />
        {query && (
          <Button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute top-1/2 right-2 -translate-y-1/2 sm:right-3',
              isHeader
                ? 'text-white/80 hover:text-white'
                : 'text-gray-400 hover:text-gray-600'
            )}
            aria-label="Clear search"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        )}
        {isLoading && !query && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <div
              className={cn(
                'h-4 w-4 animate-spin rounded-full border-2 border-t-transparent',
                isHeader ? 'border-white/80' : 'border-blue-500'
              )}
            />
          </div>
        )}
        {isLoading && query && (
          <div className="absolute top-1/2 right-10 -translate-y-1/2">
            <div
              className={cn(
                'h-4 w-4 animate-spin rounded-full border-2 border-t-transparent',
                isHeader ? 'border-white/80' : 'border-blue-500'
              )}
            />
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
                    gender={result.gender}
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
