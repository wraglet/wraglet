'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SearchResponse, SearchResultItem } from '@/interfaces'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

import Avatar from '@/components/Avatar'

const SearchResults = () => {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')

  const [results, setResults] = useState<SearchResultItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setResults([])
      return
    }

    const fetchResults = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=50`
        )
        const data: SearchResponse = await response.json()

        if (data.success) {
          setResults(data.results)
          setTotalCount(data.totalCount)
        } else {
          setError('Failed to fetch search results')
        }
      } catch (err) {
        console.error('Search error:', err)
        setError('An error occurred while searching')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query])

  // Group results by type
  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = []
      }
      acc[result.type].push(result)
      return acc
    },
    {} as Record<string, SearchResultItem[]>
  )

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'user':
        return 'People'
      case 'post':
        return 'Posts'
      case 'blog':
        return 'Blogs'
      case 'video':
        return 'Videos'
      default:
        return 'Results'
    }
  }

  if (!query) {
    return (
      <div className="mx-auto max-w-4xl px-3 py-4 md:px-4 md:py-8">
        <div className="flex flex-col items-center justify-center py-8 md:py-12">
          <MagnifyingGlassIcon className="mb-3 h-12 w-12 text-gray-300 md:mb-4 md:h-16 md:w-16" />
          <h2 className="mb-2 text-lg font-semibold text-gray-600 md:text-xl">
            Search Wraglet
          </h2>
          <p className="text-center text-sm text-gray-500 md:text-base">
            Enter a search term to find people, posts, and more
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 md:px-4 md:py-8">
      <div className="mb-4 md:mb-6">
        <h1 className="mb-2 text-xl font-bold text-gray-900 md:text-2xl">
          Search results for &quot;{query}&quot;
        </h1>
        {!isLoading && (
          <p className="text-sm text-gray-600 md:text-base">
            {totalCount} {totalCount === 1 ? 'result' : 'results'} found
          </p>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <span className="ml-3 text-gray-600">Searching...</span>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!isLoading && !error && results.length === 0 && query && (
        <div className="flex flex-col items-center justify-center py-8 md:py-12">
          <MagnifyingGlassIcon className="mb-3 h-10 w-10 text-gray-300 md:mb-4 md:h-12 md:w-12" />
          <h3 className="mb-2 text-base font-semibold text-gray-600 md:text-lg">
            No results found
          </h3>
          <p className="text-center text-sm text-gray-500 md:text-base">
            Try different keywords or check your spelling
          </p>
        </div>
      )}

      {!isLoading && !error && Object.keys(groupedResults).length > 0 && (
        <div className="space-y-4 md:space-y-8">
          {Object.entries(groupedResults).map(([type, typeResults]) => (
            <div
              key={type}
              className="rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
                <h2 className="flex items-center text-base font-semibold text-gray-900 md:text-lg">
                  <span className="mr-2">{getTypeIcon(type)}</span>
                  {getTypeLabel(type)}
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {typeResults.length}
                  </span>
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {typeResults.map((result) => (
                  <Link
                    key={result._id}
                    href={result.url}
                    className="block p-4 transition-colors hover:bg-gray-50 md:p-6"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="flex-shrink-0">
                        {result.avatar ? (
                          <Avatar
                            src={result.avatar || null}
                            size="h-10 w-10 md:h-12 md:w-12"
                            gender="Male"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-base md:h-12 md:w-12 md:text-lg">
                            {getTypeIcon(result.type)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 text-sm font-semibold text-gray-900">
                          {result.title}
                        </h3>
                        {result.subtitle && (
                          <p className="line-clamp-2 text-xs text-gray-600 md:text-sm">
                            {result.subtitle}
                          </p>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 capitalize md:px-3">
                          {result.type}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const SearchPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <Suspense
        fallback={
          <div className="mx-auto max-w-4xl px-3 py-4 md:px-4 md:py-8">
            <div className="animate-pulse">
              <div className="mb-3 h-6 w-1/2 rounded bg-gray-200 md:mb-4 md:h-8 md:w-1/3"></div>
              <div className="mb-6 h-3 w-1/3 rounded bg-gray-200 md:mb-8 md:h-4 md:w-1/4"></div>
              <div className="space-y-3 md:space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-200 bg-white p-4 md:p-6"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="h-10 w-10 rounded-full bg-gray-200 md:h-12 md:w-12"></div>
                      <div className="flex-1">
                        <div className="mb-2 h-3 w-3/4 rounded bg-gray-200 md:h-4"></div>
                        <div className="h-2 w-1/2 rounded bg-gray-200 md:h-3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </div>
  )
}

export default SearchPage
