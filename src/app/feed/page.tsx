import getPosts from '@/actions/getPosts';
import dynamic from 'next/dynamic';
import getOtherUsers from '@/actions/getOtherUsers';
import WragletAblyProvider from '../../providers/WragletAblyProvider';

const FeedBody = dynamic(() => import('./components/FeedBody'), {
  ssr: false
});

const LeftSideNav = dynamic(() => import('./components/LeftSideNav'), {
  ssr: false
});

const RightSideNav = dynamic(() => import('./components/RightSideNav'), {
  ssr: false
});

const Page = async () => {
  const otherUsers = await getOtherUsers().catch((err) => {
    console.error(
      'Error happened while getting getOtherUsers() on Feed component: ',
      err
    );
  });

  const initialPosts = await getPosts().catch((err) => {
    console.error(
      'Error happened while getting getPosts() on Feed component: ',
      err
    );
  });

  return (
    <main className='flex-grow flex lg:grid grid-cols-10 mx-6 gap-x-5 mt-14'>
      <LeftSideNav />
      <WragletAblyProvider>
        <FeedBody initialPosts={initialPosts!} />
      </WragletAblyProvider>

      <RightSideNav otherUsers={otherUsers!} />
    </main>
  );
};

export default Page;
