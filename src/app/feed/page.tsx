import Image from 'next/image';
import { Quicksand } from 'next/font/google';
import Link from 'next/link';
import HeaderRightNav from '../components/HeaderRightNav';
import LeftSideNav from './components/LeftSideNav';
import FeedBody from './components/FeedBody';

const quicksand = Quicksand({
  subsets: ['latin'],
  display: 'swap'
});

const Feed = () => {
  return (
    <div className='flex flex-col min-h-screen overflow-hidden relative bg-[rgba(110,201,247,0.15)]'>
      <header className='h-[56px] w-full bg-[#0EA5E9] px-6 items-center drop-shadow-md grid grid-cols-10 gap-x-10'>
        <div className='flex space-x-1.5 items-center h-full col-span-2'>
          <Link href='/' className='block'>
            <div className='relative h-10 w-10'>
              <Image src={'/images/logo/logo.png'} fill alt='Wraglet' />
            </div>
          </Link>
          <Link
            href={'/'}
            className={`${quicksand.className} text-xl font-bold text-white`}
          >
            wraglet
          </Link>
        </div>
        <div className='col-start-4 col-span-3 h-full flex items-center'>
          <input
            type='search'
            className='bg-[#E7ECF0] w-full h-[30px] rounded-2xl border border-solid border-[#E5E5E5] focus:outline-none px-2 text-sm text-[#333333]'
          />
        </div>
        <HeaderRightNav />
      </header>
      <main className='flex-grow grid grid-cols-10 mx-6 gap-x-5'>
        <LeftSideNav />
        <FeedBody />
        <section className='col-span-3 h-auto'></section>
      </main>
    </div>
  );
};

export default Feed;
