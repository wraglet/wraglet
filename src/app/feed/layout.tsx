import type { Metadata } from 'next';
import { Suspense } from 'react';
import Loading from '../loading';

export const metadata: Metadata = {
  title: 'Wraglet',
  description:
    "Wraglet combines the brevity of Twitter, the engagement of Reddit, and the social connections of Facebook. With a focus on concise posts (up to 800 characters) and a robust upvoting system, we're redefining the way we share content online. Additionally, our innovative Blog section allows for long-form expression, fostering deeper discussions within our community."
};

export default function FeedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}
