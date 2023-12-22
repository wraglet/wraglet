import getPosts from '@/actions/getPosts';
import dynamic from 'next/dynamic';
import getOtherUsers from '@/actions/getOtherUsers';
import deJSONify from '@/utils/deJSONify';

const AblyWrapper = dynamic(
  () => import('./components/Feed/components/AblyWrapper'),
  {
    ssr: false
  }
);

const LeftNav = dynamic(() => import('./components/LeftNav'), {
  ssr: false
});

const RightNav = dynamic(() => import('./components/RightNav'), {
  ssr: false
});

const Page = async () => {
  const jsonOtherUsers = await getOtherUsers().catch((err: any) => {
    console.error(
      'Error happened while getting getOtherUsers() on Feed component: ',
      err
    );
  });

  const jsonInitialPosts = await getPosts().catch((err: any) => {
    console.error(
      'Error happened while getting getPosts() on Feed component: ',
      err
    );
  });

  const otherUsers = deJSONify(jsonOtherUsers);
  const initialPosts = deJSONify(jsonInitialPosts);

  return (
    <main className='flex-grow flex w-full items-start mx-6 gap-x-5 mt-14 3xl:max-w-screen-2xl'>
      <LeftNav />
      <div className='tablet:ml-10 xl:ml-20 xl:mx-auto 2xl:ml-auto flex items-start gap-x-5 flex-grow sm:mx-10'>
        <AblyWrapper initialPosts={initialPosts!} />

        <RightNav otherUsers={otherUsers!} />
      </div>
    </main>
  );
};

export default Page;
