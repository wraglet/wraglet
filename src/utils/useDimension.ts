'use client';

import { RefObject, useMemo, useSyncExternalStore } from 'react';

const subscribe = (callback: (e: Event) => void) => {
  window.addEventListener('resize', callback);
  return () => {
    window.removeEventListener('resize', callback);
  };
};

const useDimensions = (ref: RefObject<HTMLElement>) => {
  const dimensions = useSyncExternalStore(subscribe, () =>
    JSON.stringify({
      width: ref.current?.offsetWidth ?? 0,
      height: ref.current?.offsetHeight ?? 0,
      left: ref.current?.getBoundingClientRect().left ?? 0,
      right: ref.current?.getBoundingClientRect().right ?? 0,
      top: ref.current?.getBoundingClientRect().top ?? 0,
      bottom: ref.current?.getBoundingClientRect().bottom ?? 0
    })
  );
  return useMemo(() => JSON.parse(dimensions), [dimensions]);
};

export { useDimensions };
