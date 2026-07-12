'use client'

import { Suspense } from 'react'
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
import { useQuery } from '@tanstack/react-query'

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
  const query = searchParams.get('q')?.trim() ?? ''

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<SearchResponse> => {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&limit=50`
      )
      const json = (await response.json()) as SearchResponse
      if (!json.success) {
        throw new Error('Failed to fetch search results')
      }
      return json
    },
    enabled: query.length > 0
  })

  const results = data?.results ?? []
  const totalCount = data?.totalCount ?? 0
  const hasQuery = query.length > 0
  const resultLabel = totalCount === 1 ? 'result' : 'results'

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
          Search results for &quot;{query}&quot;
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

    if (isError) {
      return (
        <div className={searchErrorWrapClassName}>
          <div className={searchErrorBoxClassName}>
            <p className={searchErrorTextClassName}>
              An error occurred while searching
            </p>
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

const SearchPageClient = () => (
  <CenteredListPageShell>
    <Suspense fallback={<SearchResultsSkeleton />}>
      <SearchResults />
    </Suspense>
  </CenteredListPageShell>
)

export default SearchPageClient
