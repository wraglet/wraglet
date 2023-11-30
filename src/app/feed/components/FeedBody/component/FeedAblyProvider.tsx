'use client';

import { PostInterface } from '@/app/interfaces';
import * as Ably from 'ably';
import { AblyProvider } from 'ably/react';
import FeedBody from '..';

const FeedAblyProvider = ({
  initialPosts
}: {
  initialPosts: PostInterface[];
}) => {
  const client = new Ably.Realtime.Promise({
    authUrl: '/api/token',
    authMethod: 'POST'
  });
  return (
    <AblyProvider client={client}>
      <FeedBody initialPosts={initialPosts} />
    </AblyProvider>
  );
};

export default FeedAblyProvider;
