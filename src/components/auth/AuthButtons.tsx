'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import Button from '@/components/shared/Button'

const AuthButtons = () => {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-2">
      {pathname === '/' && (
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
      {pathname !== '/' && pathname !== '/register' && (
        <>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#eaf6fd] hover:text-[#0EA5E9]"
          >
            <Link href="/">Login</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-[#0EA5E9] text-white hover:bg-[#42BBFF]"
          >
            <Link href="/register">Sign up</Link>
          </Button>
        </>
      )}
    </div>
  )
}

export default AuthButtons
