'use client'

import { Turnstile } from '@marsidev/react-turnstile'

type TurnstileWidgetProps = {
  onSuccess: (token: string) => void
  onExpire?: () => void
  onError?: () => void
}

const TurnstileWidget = ({
  onSuccess,
  onExpire,
  onError
}: TurnstileWidgetProps) => {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  if (!siteKey) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <p className="text-center text-xs text-amber-700">
          Turnstile disabled (set NEXT_PUBLIC_TURNSTILE_SITE_KEY for CAPTCHA).
        </p>
      )
    }
    return null
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-neutral-200 shadow-md [&_iframe]:block [&_iframe]:w-full">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onSuccess}
        onExpire={() => onExpire?.()}
        onError={() => onError?.()}
        options={{ theme: 'light', size: 'flexible' }}
        className="w-full"
      />
    </div>
  )
}

export default TurnstileWidget
