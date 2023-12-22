import React from 'react';
import getPostsByUsername from '@/actions/getPostsByUsername';
import dynamic from 'next/dynamic';
import deJSONify from '@/utils/deJSONify';

const Header = dynamic(() => import('./components/Header'), {
  ssr: false
});

const AblyWrapper = dynamic(() => import('./components/AblyWrapper'), {
  ssr: false
});
interface IPrams {
  username: string;
}

const ProfilePage = async ({ params }: { params: IPrams }) => {
  const { username } = params;
  const decodedUsername = decodeURIComponent(username);

  const jsonInitialPosts = await getPostsByUsername(decodedUsername);
  const initialPosts = deJSONify(jsonInitialPosts);
  return (
    <main className='flex flex-col min-h-screen overflow-hidden relative items-center w-full gap-y-6'>
      <Header />
      <AblyWrapper initialPosts={initialPosts!} />
    </main>
  );
};

export default ProfilePage;
