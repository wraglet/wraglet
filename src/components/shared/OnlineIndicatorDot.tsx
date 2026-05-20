import { mergeOnlineIndicatorDotClassName } from '@/components/shared/onlineIndicatorDotClassNames'

interface OnlineIndicatorDotProps {
  className?: string
}

const OnlineIndicatorDot = ({ className }: OnlineIndicatorDotProps) => (
  <span className={mergeOnlineIndicatorDotClassName(className)} aria-hidden />
)

export default OnlineIndicatorDot
