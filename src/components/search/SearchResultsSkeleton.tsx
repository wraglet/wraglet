import {
  centeredListPageCardClassName,
  centeredListPageCardHeaderClassName
} from '@/lib/uiChrome'

import {
  searchSkeletonAvatarClassName,
  searchSkeletonLinePrimaryClassName,
  searchSkeletonLineSecondaryClassName,
  searchSkeletonListClassName,
  searchSkeletonRowClassName,
  searchSkeletonSubtitleBarClassName,
  searchSkeletonTextBlockClassName,
  searchSkeletonTitleBarClassName
} from '@/components/search/searchResultsSkeletonClassNames'

const SEARCH_SKELETON_ROW_KEYS = [
  'search-skeleton-row-a',
  'search-skeleton-row-b',
  'search-skeleton-row-c'
] as const

const SearchResultsSkeleton = () => (
  <div className={centeredListPageCardClassName}>
    <div className={centeredListPageCardHeaderClassName}>
      <div className={searchSkeletonTitleBarClassName} />
      <div className={searchSkeletonSubtitleBarClassName} />
    </div>
    <div className={searchSkeletonListClassName}>
      {SEARCH_SKELETON_ROW_KEYS.map((rowKey) => (
        <div key={rowKey} className={searchSkeletonRowClassName}>
          <div className={searchSkeletonAvatarClassName} />
          <div className={searchSkeletonTextBlockClassName}>
            <div className={searchSkeletonLinePrimaryClassName} />
            <div className={searchSkeletonLineSecondaryClassName} />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default SearchResultsSkeleton
