'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

const LoginVerifiedBanner = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const handledQueryRef = useRef<string | null>(null)

  useEffect(() => {
    const verified = searchParams.get('verified')
    const error = searchParams.get('error')
    let queryKey: string | null = null
    if (verified) {
      queryKey = `verified:${verified}`
    } else if (error) {
      queryKey = `error:${error}`
    }

    if (!queryKey || handledQueryRef.current === queryKey) {
      return
    }

    handledQueryRef.current = queryKey

    if (verified === '1') {
      toast.success('Email verified. You can sign in now.')
    } else if (error === 'invalid_verify_link') {
      toast.error('This verification link is invalid or has expired.')
    } else if (error === 'verify_failed') {
      toast.error(
        'Could not verify your email. Request a new link from the login page.'
      )
    } else if (error === 'account_suspended') {
      toast.error(
        'This account has been suspended. Contact support if you need help.'
      )
    } else {
      return
    }

    router.replace('/', { scroll: false })
  }, [router, searchParams])

  return null
}

export default LoginVerifiedBanner
