'use client';

import WragletAblyProvider from '@/providers/WragletAblyProvider';
import Body from './Body';
import { PostDocument } from '@/models/Post';

type Props = {
  initialPosts: PostDocument[];
};

const AblyWrapper = ({ initialPosts }: Props) => {
  return (
    <WragletAblyProvider>
      <Body initialPosts={initialPosts!} />
    </WragletAblyProvider>
  );
};

export default AblyWrapper;
