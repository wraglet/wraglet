'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SearchResponse, SearchResultItem } from '@/interfaces'
import {
  centeredListPageBadgeClassName,
  centeredListPageBodyTextUnreadClassName,
  centeredListPageCardClassName,
  centeredListPageCardHeaderClassName,
  centeredListPageEmptyBodyClassName,
  centeredListPageEmptyIconClassName,
  centeredListPageEmptyStateClassName,
  centeredListPageEmptyTitleClassName,
  centeredListPageRowClassName,
  centeredListPageSecondaryTextClassName,
  centeredListPageSectionHeaderClassName,
  centeredListPageSubtitleClassName,
  centeredListPageTitleClassName
} from '@/lib/uiChrome'
import { cn } from '@/lib/utils'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

import CenteredListPageShell from '@/components/layout/CenteredListPageShell'
import SearchResultsSkeleton from '@/components/search/SearchResultsSkeleton'
import Avatar from '@/components/shared/Avatar'

import {
  searchErrorBoxClassName,
  searchErrorTextClassName,
  searchErrorWrapClassName,
  searchLoadingSpinnerClassName,
  searchResultsListClassName,
  searchResultTypeBadgeClassName,
  searchSectionTitleClassName,
  searchSubtitleClassName
} from '@/app/(authenticated)/search/searchPageClassNames'

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

  const trimmedQuery = query?.trim() ?? ''
  const hasQuery = trimmedQuery.length > 0
  const resultLabel = totalCount === 1 ? 'result' : 'results'

  const renderHeader = () => {
    if (!hasQuery) {
      return (
        <div className={centeredListPageCardHeaderClassName}>
          <h1 className={centeredListPageTitleClassName}>Search</h1>
          <p
            className={cn(
              searchSubtitleClassName,
              centeredListPageSubtitleClassName
            )}
          >
            Find people, posts, blogs, and more
          </p>
        </div>
      )
    }

    return (
      <div className={centeredListPageCardHeaderClassName}>
        <h1 className={centeredListPageTitleClassName}>
          Search results for &quot;{trimmedQuery}&quot;
        </h1>
        {isLoading ? null : (
          <p
            className={cn(
              searchSubtitleClassName,
              centeredListPageSubtitleClassName
            )}
          >
            {totalCount} {resultLabel} found
          </p>
        )}
      </div>
    )
  }

  const renderBody = () => {
    if (!hasQuery) {
      return (
        <div className={centeredListPageEmptyStateClassName}>
          <MagnifyingGlassIcon className={centeredListPageEmptyIconClassName} />
          <h2 className={centeredListPageEmptyTitleClassName}>
            Search Wraglet
          </h2>
          <p className={centeredListPageEmptyBodyClassName}>
            Enter a search term in the bar above
          </p>
        </div>
      )
    }

    if (isLoading) {
      return (
        <div className={centeredListPageEmptyStateClassName}>
          <div className={searchLoadingSpinnerClassName} />
          <p className={centeredListPageEmptyBodyClassName}>Searching...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className={searchErrorWrapClassName}>
          <div className={searchErrorBoxClassName}>
            <p className={searchErrorTextClassName}>{error}</p>
          </div>
        </div>
      )
    }

    if (results.length === 0) {
      return (
        <div className={centeredListPageEmptyStateClassName}>
          <MagnifyingGlassIcon className={centeredListPageEmptyIconClassName} />
          <h3 className={centeredListPageEmptyTitleClassName}>
            No results found
          </h3>
          <p className={centeredListPageEmptyBodyClassName}>
            Try different keywords or check your spelling
          </p>
        </div>
      )
    }

    return (
      <div className={searchResultsListClassName}>
        {Object.entries(groupedResults).map(([type, typeResults]) => (
          <div key={type}>
            <div className={centeredListPageSectionHeaderClassName}>
              <h2 className={searchSectionTitleClassName}>
                <span aria-hidden>{getTypeIcon(type)}</span>
                {getTypeLabel(type)}
                <span className={centeredListPageBadgeClassName}>
                  {typeResults.length}
                </span>
              </h2>
            </div>
            {typeResults.map((result) => (
              <Link
                key={result._id}
                href={result.url}
                className={centeredListPageRowClassName}
              >
                <div className="shrink-0">
                  <Avatar src={result.avatar || null} gender={result.gender} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className={centeredListPageBodyTextUnreadClassName}>
                    {result.title}
                  </p>
                  {result.subtitle ? (
                    <p className={centeredListPageSecondaryTextClassName}>
                      {result.subtitle}
                    </p>
                  ) : null}
                </div>

                <span
                  className={cn(
                    searchResultTypeBadgeClassName,
                    centeredListPageBadgeClassName
                  )}
                >
                  {result.type}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={centeredListPageCardClassName}>
      {renderHeader()}
      {renderBody()}
    </div>
  )
}

const SearchPage = () => (
  <CenteredListPageShell>
    <Suspense fallback={<SearchResultsSkeleton />}>
      <SearchResults />
    </Suspense>
  </CenteredListPageShell>
)

export default SearchPage
