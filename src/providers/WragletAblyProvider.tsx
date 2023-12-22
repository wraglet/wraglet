'use client';

import * as Ably from 'ably';
import { AblyProvider } from 'ably/react';

const WragletAblyProvider = ({ children }: { children: React.ReactNode }) => {
  const client = new Ably.Realtime.Promise({
    authUrl: '/api/token',
    authMethod: 'POST'
  });
  return <AblyProvider client={client}>{children}</AblyProvider>;
};

export default WragletAblyProvider;
