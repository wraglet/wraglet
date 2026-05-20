import {
  centeredListPageInnerClassName,
  centeredListPageMainClassName,
  mergeClassNames
} from '@/lib/uiChrome'

export const buildCenteredListPageShellClassNames = (
  className?: string,
  innerClassName?: string
) => ({
  main: mergeClassNames(centeredListPageMainClassName, className),
  inner: mergeClassNames(centeredListPageInnerClassName, innerClassName)
})
