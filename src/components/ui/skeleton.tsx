import { cn } from '@/lib/utils'

const Skeleton = ({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLDivElement>>) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-neutral-900/10 dark:bg-neutral-50/10',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
