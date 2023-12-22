export const dynamic = 'force-dynamic';

import getCurrentUser from '@/actions/getCurrentUser';
import Header from '@/components/Header';
import React, { Suspense } from 'react';
import deJSONify from '@/utils/deJSONify';
import Loading from '@/app/loading';

const ProfileLayout = async ({ children }: { children: React.ReactNode }) => {
  const jsonCurrentUser = await getCurrentUser().catch((err: any) => {
    console.error(
      'Error happened while getting getCurrentUser() on Feed component: ',
      err
    );
  });

  const currentUser = deJSONify(jsonCurrentUser);

  return (
    <div className='flex flex-col min-h-screen overflow-hidden relative bg-[rgba(110,201,247,0.15)]'>
      <Header currentUser={currentUser!} />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </div>
  );
};

export default ProfileLayout;
