import { Suspense } from 'react'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import getSession from '@/actions/getSession'
import { HiOutlineChatBubbleLeftRight, HiOutlineUsers } from 'react-icons/hi2'

import Footer from '@/components/Footer'
import LoginForm from '@/components/LoginForm'

const Page = async () => {
  const session = await getSession()

  if (session?.user) {
    redirect('/feed')
  } else
    return (
      <main className="flex min-h-screen flex-col items-center justify-between overflow-hidden">
        <section className="grid w-full flex-grow grid-cols-2">
          <div className="relative col-span-1 block bg-[#42BBFF]">
            <div className="ml-44 flex h-full w-full flex-col justify-center gap-y-4 text-white">
              <div className="flex items-center gap-5">
                <HiOutlineChatBubbleLeftRight />
                <h2 className="text-base font-medium">Join conversation.</h2>
              </div>
              <div className="flex items-center gap-5">
                <HiOutlineUsers />
                <h2 className="text-base font-medium">Make new friends.</h2>
              </div>
            </div>
            <div className="absolute bottom-[-244px] right-[-65px] -z-0">
              <div className="relative">
                <div className="block h-[535px] w-[552px]">
                  <Image
                    priority
                    src={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/images/logo/logo.png`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    width={1}
                    height={1}
                    style={{ height: '100%', width: '100%' }}
                    alt="Wraglet logo"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="relative col-span-1 block">
            <div className="flex h-full w-full items-center justify-center">
              <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
              </Suspense>
            </div>
            <div className="absolute bottom-0 left-0 h-[150px] w-[65px] bg-white" />
          </div>
        </section>
        <Footer />
      </main>
    )
}

export default Page
