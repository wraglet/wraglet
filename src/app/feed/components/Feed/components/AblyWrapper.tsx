'use client';

import WragletAblyProvider from '@/providers/WragletAblyProvider';
import Feed from '..';
import { PostDocument } from '@/models/Post';

type Props = {
  initialPosts: PostDocument[];
};

const AblyWrapper = ({ initialPosts }: Props) => {
  return (
    <WragletAblyProvider>
      <Feed initialPosts={initialPosts!} />
    </WragletAblyProvider>
  );
};

export default AblyWrapper;
