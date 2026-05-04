import { Dosis, Inter } from 'next/font/google'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const dosis = Dosis({ subsets: ['latin'], weight: ['700'], display: 'swap' })
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
})

const meta = {
  title: 'Foundations/Fonts',
  tags: ['autodocs']
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const FontFamilies: Story = {
  render: () => (
    <div className="space-y-6">
      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-900">
          Primary App Font
        </h2>
        <p className="text-xs text-gray-600">
          Source: `src/app/layout.tsx` via `next/font/google`
        </p>
        <p className={`mt-2 text-sm text-gray-700 ${inter.className}`}>
          Inter (400/500/600/700) - used as the default UI/body font across the
          app.
        </p>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-900">
          Brand Wordmark Font
        </h2>
        <p className="text-xs text-gray-600">
          Source: `src/app/(unauthenticated)/layout.tsx` via `next/font/google`
        </p>
        <p className={`mt-2 text-3xl text-[#0EA5E9] ${dosis.className}`}>
          wraglet
        </p>
        <p className="mt-1 text-xs text-gray-500">Dosis, weight 700</p>
      </section>
    </div>
  )
}

export const TypeScalePreview: Story = {
  render: () => (
    <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-3xl font-bold text-gray-900">Display / Hero</p>
      <p className="text-xl font-semibold text-gray-900">Heading Large</p>
      <p className="text-lg font-semibold text-gray-900">Heading Medium</p>
      <p className="text-sm leading-relaxed font-medium text-gray-700">
        Body text sample using current app defaults.
      </p>
      <p className="text-xs font-medium text-gray-500">
        Caption / metadata text
      </p>
      <a
        className="text-sm font-medium text-[#0EA5E9] underline-offset-4 hover:underline"
        href="https://wraglet.com"
      >
        Link style sample
      </a>
    </div>
  )
}
