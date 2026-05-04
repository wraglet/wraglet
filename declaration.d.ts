import type { DetailedHTMLProps, HTMLAttributes } from 'react'

type LottiePlayerAttributes = HTMLAttributes<HTMLElement> & {
  autoplay?: boolean
  loop?: boolean
  mode?: string
  src?: string
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'lottie-player': DetailedHTMLProps<LottiePlayerAttributes, HTMLElement>
    }
  }
}

export {}
