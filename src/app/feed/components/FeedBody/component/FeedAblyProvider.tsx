'use client';

import { PostInterface, UserInterface } from '@/app/interfaces';
import * as Ably from 'ably';
import { AblyProvider } from 'ably/react';
import dynamic from 'next/dynamic';

const FeedBody = dynamic(() => import('..'), {
  ssr: false
});

const client = new Ably.Realtime.Promise({
  authUrl: '/api/token',
  authMethod: 'POST'
});

type Props = {
  currentUser: UserInterface;
  initialPosts: PostInterface[];
};

const FeedAblyProvider = ({ currentUser, initialPosts }: Props) => {
  return (
    <AblyProvider client={client}>
      <FeedBody currentUser={currentUser} initialPosts={initialPosts} />
    </AblyProvider>
  );
};

export default FeedAblyProvider;
