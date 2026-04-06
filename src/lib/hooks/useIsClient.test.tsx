import { useIsClient } from '@/lib/hooks/useIsClient'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

const Probe = () => (
  <span data-testid="client">{useIsClient() ? 'client' : 'server'}</span>
)

describe('useIsClient', () => {
  it('resolves to client in jsdom', () => {
    render(<Probe />)
    expect(screen.getByTestId('client')).toHaveTextContent('client')
  })
})
