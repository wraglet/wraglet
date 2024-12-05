'use client'

import { Fragment, useReducer } from 'react'
import { FaCamera } from 'react-icons/fa'

import UploadProfilePicture from '@/app/(authenticated)/[username]/_components/UploadProfilePicture'

type ProfilePictureHoverProps = {
  profilePicture: string
}

const ProfilePictureHover = ({ profilePicture }: ProfilePictureHoverProps) => {
  const reducer = (state: any, action: any) => ({ ...state, ...action })

  const initialState = {
    openUploadProfilePictureModal: false
  }

  const [{ openUploadProfilePictureModal }, dispatchState] = useReducer(
    reducer,
    initialState
  )

  const handleUpdateProfilePicture = (e: any, profilePicture: string) => {
    console.log(e, profilePicture)
  }

  return (
    <Fragment>
      <UploadProfilePicture
        profilePicture={profilePicture}
        show={openUploadProfilePictureModal}
        close={() => dispatchState({ openUploadProfilePictureModal: false })}
        setProfilePicture={(profilePicture: string, e) =>
          handleUpdateProfilePicture(e, profilePicture)
        }
      />

      <button
        onClick={() => dispatchState({ openUploadProfilePictureModal: true })}
        className="absolute bottom-2.5 right-2.5 hidden h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#D9D9D9] shadow-md group-hover:flex md:h-9 md:w-9"
      >
        <FaCamera className="text-[8px] text-black md:text-sm" />
      </button>
    </Fragment>
  )
}

export default ProfilePictureHover
