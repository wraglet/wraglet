import Header from '../components/Header';
import getCurrentUser from '../actions/getCurrentUser';
import { PostInterface } from '../interfaces';
import getPosts from '../actions/getPosts';
import dynamic from 'next/dynamic';

const FeedAblyProvider = dynamic(
  () => import('./components/FeedBody/component/FeedAblyProvider'),
  {
    ssr: false
  }
);

const LeftSideNav = dynamic(() => import('./components/LeftSideNav'), {
  ssr: false
});

const Feed = async () => {
  const currentUser = await getCurrentUser();

  const initialPosts: PostInterface[] = await getPosts();

  return (
    <div className='flex flex-col min-h-screen overflow-hidden relative bg-[rgba(110,201,247,0.15)]'>
      <Header currentUser={currentUser!} />
      <main className='flex-grow grid grid-cols-10 mx-6 gap-x-5 mt-14'>
        <LeftSideNav currentUser={currentUser!} />
        <FeedAblyProvider
          currentUser={currentUser!}
          initialPosts={initialPosts!}
        />
        <section className='col-span-3 h-auto'></section>
      </main>
    </div>
  );
};

export default Feed;
