'use client'

import localFont from 'next/font/local'
import { usePathname } from 'next/navigation'

const geistSans = localFont({
  src: '../../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})

interface UnauthenticatedLayoutClientProps {
  children: React.ReactNode
}

const UnauthenticatedLayoutClient = ({
  children
}: UnauthenticatedLayoutClientProps) => {
  const pathname = usePathname()
  const isLoginPage = pathname === '/'
  const isRegisterPage = pathname === '/register'

  return (
    <div
      className={`animate-fade-in-up relative mx-2 flex ${isLoginPage ? 'min-h-fit' : 'h-full'} max-h-[calc(100vh-200px)] w-full overflow-hidden rounded-3xl bg-white/80 shadow-2xl ${
        isRegisterPage || isLoginPage ? 'max-w-md' : 'max-w-3xl'
      }`}
    >
      {/* Thematic blue left border */}
      <div className="hidden w-2 rounded-l-3xl bg-gradient-to-b from-[#42BBFF] to-[#0EA5E9] sm:block" />
      <div
        className={`${geistSans.variable} flex flex-1 flex-col overflow-hidden`}
      >
        <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export default UnauthenticatedLayoutClient
