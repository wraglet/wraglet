'use client';

import { PostInterface, UserInterface } from '@/app/interfaces';
import * as Ably from 'ably';
import { AblyProvider } from 'ably/react';
import FeedBody from '..';

const FeedAblyProvider = ({
  currentUser,
  initialPosts
}: {
  initialPosts: PostInterface[];
  currentUser: UserInterface;
}) => {
  const client = new Ably.Realtime.Promise({
    authUrl: '/api/token',
    authMethod: 'POST'
  });
  return (
    <AblyProvider client={client}>
      <FeedBody initialPosts={initialPosts} currentUser={currentUser} />
    </AblyProvider>
  );
};

export default FeedAblyProvider;
