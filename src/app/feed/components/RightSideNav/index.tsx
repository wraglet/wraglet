'use client';

import Avatar from '@/app/components/Avatar';
import { UserInterface } from '@/app/interfaces';
import { useDimensions } from '@/app/utils/useDimension';
import { Lato } from 'next/font/google';
import { useState, useRef, useEffect } from 'react';
import { IoPersonAddSharp } from 'react-icons/io5';

const lato = Lato({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
  preload: true
});

const RigthSideNav = ({ otherUsers }: { otherUsers: UserInterface[] }) => {
  const [hydrated, setHydrated] = useState(false);

  const ref = useRef(null);

  const { width } = useDimensions(ref);

  useEffect(() => {
    // This forces a rerender, so the date is rendered
    // the second time but not the first
    setHydrated(true);
  }, []);
  if (!hydrated) {
    // Returns null on first render, so the client and server match
    return null;
  }
  return (
    <section ref={ref} className='col-end-11 col-span-3 h-auto mt-6 relative'>
      <div style={{ width: `${width}px` }} className='fixed'>
        <div className='w-full drop-shadow-md  px-4 py-3'>
          <div className='flex flex-col w-full gap-y-3.5'>
            <h6
              className={`ml-4 ${lato.className} font-normal text-xs text-[#333333]`}
            >
              Friend Suggestions
            </h6>

            {otherUsers.map((user) => (
              <div
                key={user.id}
                className='flex rounded-lg group px-3 h-[50px] hover:ring-1 hover:ring-solid hover:bg-white hover:ring-neutral-200 items-center cursor-pointer'
              >
                <div className='flex items-center space-x-2 flex-1'>
                  <Avatar
                    className='group-hover:border-white'
                    alt={`${user.firstName}'s Profile`}
                    src={user.profilePicture}
                  />
                  <div className='flex flex-col gap-y-0.5'>
                    <h3 className='group-hover:text-gray-700 text-sm font-semibold text-[#333333]'>
                      {user.firstName} {user.lastName}
                    </h3>
                    <h4 className='group-hover:text-gray-700 text-[10px] font-semibold text-[#333333]'>
                      0 mutual friends
                    </h4>
                  </div>
                </div>
                <IoPersonAddSharp className='hover:text-blue-500' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RigthSideNav;
