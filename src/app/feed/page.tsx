import Header from '../components/Header';
import getCurrentUser from '../actions/getCurrentUser';
import { PostInterface, UserInterface } from '../interfaces';
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
  const currentUser = await getCurrentUser();
  const otherUsers: UserInterface[] = await getOtherUsers();

  const initialPosts: PostInterface[] = await getPosts();

  return (
    <div className='flex flex-col min-h-screen overflow-hidden relative bg-[rgba(110,201,247,0.15)]'>
      <Header currentUser={currentUser!} />
      <main className='flex-grow grid grid-cols-10 mx-6 gap-x-5 mt-14'>
        <LeftSideNav currentUser={currentUser!} />
        {!!initialPosts ? (
          <FeedAblyProvider initialPosts={initialPosts} />
        ) : (
          <section className='col-span-5 h-auto flex flex-col mt-6 w-full gap-y-4 overflow-auto' />
        )}

        <RightSideNav otherUsers={otherUsers!} />
      </main>
    </div>
  );
};

export default Feed;
