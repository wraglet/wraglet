'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const AuthButtons = () => {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-2">
      {pathname === '/' && (
        <Link
          href="/register"
          className="rounded-md border border-[#0EA5E9] bg-white px-3 py-1 text-sm font-semibold text-[#0EA5E9] shadow transition-colors hover:bg-[#eaf6fd]"
        >
          Sign up
        </Link>
      )}
      {pathname === '/register' && (
        <Link
          href="/"
          className="rounded-md border border-[#0EA5E9] bg-white px-3 py-1 text-sm font-semibold text-[#0EA5E9] shadow transition-colors hover:bg-[#eaf6fd]"
        >
          Login
        </Link>
      )}
      {pathname !== '/' && pathname !== '/register' && (
        <>
          <Link
            href="/"
            className="rounded-md border border-[#0EA5E9] bg-white px-3 py-1 text-sm font-semibold text-[#0EA5E9] shadow transition-colors hover:bg-[#eaf6fd]"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-[#0EA5E9] bg-[#0EA5E9] px-3 py-1 text-sm font-semibold text-white shadow transition-colors hover:bg-[#42BBFF]"
          >
            Sign up
          </Link>
        </>
      )}
    </div>
  )
}

export default AuthButtons
