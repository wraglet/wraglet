import { Dosis } from 'next/font/google'
import localFont from 'next/font/local'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import getSession from '@/actions/getSession'

import AuthCard from '@/components/AuthCard'

const dosis = Dosis({ subsets: ['latin'], weight: ['700'], display: 'swap' })
const geistSans = localFont({
  src: './../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})

const avatars = [
  'https://source.unsplash.com/40x40/?portrait&sig=1',
  'https://source.unsplash.com/40x40/?portrait&sig=2',
  'https://source.unsplash.com/40x40/?portrait&sig=3',
  'https://source.unsplash.com/40x40/?portrait&sig=4',
  'https://source.unsplash.com/40x40/?portrait&sig=5'
]

const Page = async () => {
  const session = await getSession()

  if (session?.user) {
    redirect('/feed')
  } else
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-between overflow-x-hidden bg-gradient-to-br from-[#eaf6fd] via-[#e3f1fa] to-[#b3e0fa]">
        {/* Top logo/wordmark */}
        <div className="animate-fade-in-down z-20 flex w-full flex-col items-center pt-8 pb-2">
          <div className="flex items-center gap-2">
            <Image
              src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/logo/android-chrome-192x192.png`}
              width={40}
              height={40}
              alt="Wraglet logo"
            />
            <span
              className={`${dosis.className} text-2xl font-bold tracking-tight text-[#0EA5E9] underline decoration-[#42BBFF] underline-offset-4`}
            >
              wraglet
            </span>
          </div>
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
        {/* Glassmorphic card */}
        <section className="relative z-20 flex w-full flex-1 items-center justify-center pb-8">
          <AuthCard />
        </section>
        {/* Improved Footer with globe icon */}
        <footer className="mt-auto flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/30 bg-transparent px-2 py-3 text-xs font-medium text-[#1B87EA]">
          <a
            href="#"
            className="transition-colors hover:underline focus:underline"
          >
            Help
          </a>
          <a
            href="#"
            className="transition-colors hover:underline focus:underline"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="transition-colors hover:underline focus:underline"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="transition-colors hover:underline focus:underline"
          >
            Cookie Policy
          </a>
          <a
            href="#"
            className="transition-colors hover:underline focus:underline"
          >
            Advertising
          </a>
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

export default Page
