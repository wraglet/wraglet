'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import Button from '@/components/shared/Button'

const AuthButtons = () => {
  const pathname = usePathname()
  const isLoginFlowPage =
    pathname === '/' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/verify-email'

  return (
    <div className="flex items-center gap-2">
      {isLoginFlowPage && (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#eaf6fd] hover:text-[#0EA5E9]"
        >
          <Link href="/register">Sign up</Link>
        </Button>
      )}
      {pathname === '/register' && (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#eaf6fd] hover:text-[#0EA5E9]"
        >
          <Link href="/">Login</Link>
        </Button>
      )}
    </div>
  )
}

export default AuthButtons
