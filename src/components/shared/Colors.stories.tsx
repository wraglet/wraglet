import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  title: 'Foundations/Colors',
  tags: ['autodocs']
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const corePalette = [
  {
    name: 'Brand Blue',
    value: '#0EA5E9',
    usage: 'primary buttons, links, accents'
  },
  {
    name: 'Brand Light Blue',
    value: '#42BBFF',
    usage: 'brand gradients and hover states'
  },
  {
    name: 'Brand Deep Blue',
    value: '#1B87EA',
    usage: 'focus/menu active state and footer accent'
  },
  { name: 'Neutral Dark', value: '#333333', usage: 'main body text' },
  {
    name: 'Surface Gray',
    value: '#E7ECF0',
    usage: 'search and comment input background'
  },
  { name: 'Border Gray', value: '#E5E5E5', usage: 'input borders' },
  { name: 'Divider Gray', value: '#DFE4EA', usage: 'modal/header separators' },
  {
    name: 'Brand Tint',
    value: '#EAF6FD',
    usage: 'outline hover/background tint'
  },
  { name: 'Soft Tint', value: '#E3F1FA', usage: 'auth section separators' }
]

const supportingPalette = [
  {
    name: 'Muted Blue Surface',
    value: '#BFE6FC',
    usage:
      'legacy reference; mobile chat/discover floaters use frosted white + sky in app'
  },
  {
    name: 'Muted Gray Surface',
    value: '#D9D9D9',
    usage: 'photo/camera hover controls'
  },
  {
    name: 'Navy Utility',
    value: '#01205D',
    usage: 'secondary text/action in upload modal'
  },
  { name: 'White', value: '#FFFFFF', usage: 'cards and overlays' },
  {
    name: 'Black Overlay',
    value: '#000000',
    usage: 'icon fallback and overlays'
  }
]

export const Palette: Story = {
  render: () => (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Core Palette</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {corePalette.map((color) => (
            <div
              key={color.value}
              className="rounded-lg border border-neutral-200 bg-white p-3"
            >
              <div
                className="h-14 w-full rounded-md border border-neutral-200"
                style={{ backgroundColor: color.value }}
              />
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {color.name}
              </p>
              <p className="text-xs text-gray-600">{color.value}</p>
              <p className="mt-1 text-xs text-gray-500">{color.usage}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Supporting Palette
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {supportingPalette.map((color) => (
            <div
              key={color.value}
              className="rounded-lg border border-neutral-200 bg-white p-3"
            >
              <div
                className="h-14 w-full rounded-md border border-neutral-200"
                style={{ backgroundColor: color.value }}
              />
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {color.name}
              </p>
              <p className="text-xs text-gray-600">{color.value}</p>
              <p className="mt-1 text-xs text-gray-500">{color.usage}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">Brand Gradient</h2>
        <div className="rounded-lg border border-neutral-200 bg-white p-3">
          <div
            className="h-16 w-full rounded-md"
            style={{
              background: 'linear-gradient(90deg, #42BBFF 0%, #0EA5E9 100%)'
            }}
          />
          <p className="mt-2 text-xs text-gray-600">
            `linear-gradient(90deg, #42BBFF 0%, #0EA5E9 100%)`
          </p>
        </div>
      </section>
    </div>
  )
}
