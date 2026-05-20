import { buildCenteredListPageShellClassNames } from '@/components/layout/centeredListPageShellClassNames'

interface CenteredListPageShellProps {
  children: React.ReactNode
  className?: string
  innerClassName?: string
}

const CenteredListPageShell = ({
  children,
  className,
  innerClassName
}: CenteredListPageShellProps) => {
  const shellClassNames = buildCenteredListPageShellClassNames(
    className,
    innerClassName
  )

  return (
    // prettier-ignore
    <main className={shellClassNames.main}><div className={shellClassNames.inner}>{children}</div></main>
  )
}

export default CenteredListPageShell
