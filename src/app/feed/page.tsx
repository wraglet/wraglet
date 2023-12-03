import Header from '../components/Header';
import getCurrentUser from '../actions/getCurrentUser';
import getPosts from '../actions/getPosts';
import dynamic from 'next/dynamic';
import getOtherUsers from '../actions/getOtherUsers';

const FeedAblyProvider = dynamic(
  () => import('./components/FeedBody/component/FeedAblyProvider'),
  {
    ssr: false
  }
);

const LeftSideNav = dynamic(() => import('./components/LeftSideNav'), {
  ssr: false
});

const RightSideNav = dynamic(() => import('./components/RightSideNav'), {
  ssr: false
});

const Feed = async () => {
  const currentUser = await getCurrentUser().catch((err) => {
    console.error(
      'Error happened while getting getCurrentUser() on Feed component: ',
      err
    );
  });
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
    <div className='flex flex-col min-h-screen overflow-hidden relative bg-[rgba(110,201,247,0.15)]'>
      <Header currentUser={currentUser!} />
      <main className='flex-grow flex lg:grid grid-cols-10 mx-6 gap-x-5 mt-14'>
        <LeftSideNav currentUser={currentUser!} />
        <FeedAblyProvider initialPosts={initialPosts!} />

        <RightSideNav otherUsers={otherUsers!} />
      </main>
    </div>
  );
};

export default Feed;
