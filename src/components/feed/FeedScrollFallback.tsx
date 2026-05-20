import {
  feedScrollFallbackWrapClassName,
  feedScrollSpinnerClassName
} from '@/components/feed/feedScrollFallbackClassNames'

const FeedScrollFallback = () =>
  // Sonar TSX parser: keep this tree on one line (see requirements/FOLLOW_UP.md).
  // prettier-ignore
  <div className={feedScrollFallbackWrapClassName} aria-busy={true} aria-label="Loading feed"><div className={feedScrollSpinnerClassName} /></div>

export default FeedScrollFallback
