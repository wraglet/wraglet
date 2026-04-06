import type { ReactElement, SVGProps } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import * as Icons from '@/components/shared/Icons'

type IconExport = (props: SVGProps<SVGSVGElement>) => ReactElement

const iconEntries = Object.entries(Icons).filter(
  (e): e is [string, IconExport] =>
    typeof e[1] === 'function' && e[0] !== 'default'
)

describe('Icons', () => {
  it.each(iconEntries)('renders %s as svg', (name, Icon) => {
    const { container } = render(<Icon aria-label={name} />)
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
