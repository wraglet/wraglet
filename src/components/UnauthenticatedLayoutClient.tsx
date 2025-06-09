'use client'

import { Dosis } from 'next/font/google'
import localFont from 'next/font/local'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import '@/app/globals.css'

const dosis = Dosis({ subsets: ['latin'], weight: ['700'], display: 'swap' })
const geistSans = localFont({
  src: './../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})

const UnauthenticatedLayoutClient = ({
  children
}: {
  children: React.ReactNode
}) => {
  const pathname = usePathname()
  const isAuthPage = pathname === '/'

  return (
    <main className="relative flex h-screen flex-col items-center justify-between overflow-hidden bg-gradient-to-br from-[#eaf6fd] via-[#e3f1fa] to-[#b3e0fa]">
      {/* Top logo/wordmark */}
      <div className="animate-fade-in-down z-20 flex w-full justify-start px-6 pt-8 pb-2">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/logo/android-chrome-192x192.png`}
            width={40}
            height={40}
            alt="Wraglet logo"
          />
          <span
            className={`${dosis.className} text-2xl font-bold tracking-tight text-[#0EA5E9]`}
          >
            wraglet
          </span>
        </Link>
      </div>

      {/* Globe illustration: only show on md+ */}
      <div className="animate-fade-in-up pointer-events-none absolute bottom-0 left-0 z-10 hidden select-none md:block">
        <div className="relative h-[420px] w-[430px] xl:h-[535px] xl:w-[552px]">
          <Image
            priority
            src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/logo/logo.png`}
            fill
            style={{
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 60px #42BBFF88)'
            }}
            alt="Wraglet globe"
          />
        </div>
      </div>

      {/* Mobile abstract background pattern */}
      <div className="absolute inset-0 z-0 block bg-[url('/images/mobile-bg.svg')] bg-cover bg-top bg-no-repeat opacity-30 md:hidden" />

      {/* Authentication card (smaller) */}
      {isAuthPage ? (
        <section className="relative z-20 flex w-full flex-1 items-center justify-center overflow-hidden px-2 py-4">
          <div className="animate-fade-in-up relative mx-2 flex max-h-[calc(100vh-120px)] min-h-fit w-full max-w-md overflow-hidden rounded-3xl bg-white/80 shadow-2xl">
            {/* Thematic blue left border */}
            <div className="hidden w-2 rounded-l-3xl bg-gradient-to-b from-[#42BBFF] to-[#0EA5E9] sm:block" />
            <div
              className={`${geistSans.variable} flex flex-1 flex-col overflow-hidden`}
            >
              <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex-1 overflow-y-auto">
                {children}
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Legal content card (wider and scrollable) */
        <section className="relative z-20 flex w-full flex-1 items-center justify-center overflow-hidden px-2 py-4">
          <div className="animate-fade-in-up relative mx-2 flex h-full max-h-[calc(100vh-200px)] w-full max-w-3xl overflow-hidden rounded-3xl bg-white/80 shadow-2xl">
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
        </section>
      )}

      {/* Footer */}
      <footer className="z-20 mt-auto flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/30 bg-transparent px-2 py-3 text-xs font-medium text-[#1B87EA]">
        <Link
          href="/help"
          className="transition-colors hover:underline focus:underline"
        >
          Help
        </Link>
        <Link
          href="/changelog"
          className="transition-colors hover:underline focus:underline"
        >
          Changelog
        </Link>
        <Link
          href="/terms-of-service"
          className="transition-colors hover:underline focus:underline"
        >
          Terms of Service
        </Link>
        <Link
          href="/privacy-policy"
          className="transition-colors hover:underline focus:underline"
        >
          Privacy Policy
        </Link>
        <Link
          href="/cookie-policy"
          className="transition-colors hover:underline focus:underline"
        >
          Cookie Policy
        </Link>
        <Link
          href="/advertising"
          className="transition-colors hover:underline focus:underline"
        >
          Advertising
        </Link>
        <span className="flex w-full items-center justify-center gap-1 text-center text-[11px] font-semibold text-[#0EA5E9]">
          <Image
            src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/logo/android-chrome-192x192.png`}
            width={16}
            height={16}
            alt="Globe icon"
            className="inline-block"
          />
          &copy; {new Date().getFullYear()} Wraglet
        </span>
      </footer>
    </main>
  )
}

export default UnauthenticatedLayoutClient
