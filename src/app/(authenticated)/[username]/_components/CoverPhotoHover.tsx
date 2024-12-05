'use client'

import { FaCamera } from 'react-icons/fa'

const CoverPhotoHover = () => {
  return (
    <div className="absolute bottom-2.5 right-2.5 hidden h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#D9D9D9] shadow-md group-hover:flex md:h-9 md:w-9">
      <FaCamera className="text-[8px] text-black md:text-sm" />
    </div>
  )
}

export default CoverPhotoHover
