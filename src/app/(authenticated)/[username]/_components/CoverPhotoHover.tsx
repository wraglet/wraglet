'use client'

import { Fragment, useReducer } from 'react'
import useUserStore from '@/store/user'
import deJSONify from '@/utils/deJSONify'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FaCamera } from 'react-icons/fa'

import UploadCoverPhoto from '@/app/(authenticated)/[username]/_components/UploadCoverPhoto'

// You can reuse UploadProfilePicture for cover photo, or create a new one if needed

type CoverPhotoHoverProps = {
  coverPhoto: string
}

const CoverPhotoHover = ({ coverPhoto }: CoverPhotoHoverProps) => {
  const reducer = (state: any, action: any) => ({ ...state, ...action })
  const setUser = useUserStore((state) => state.setUser)
  const queryClient = useQueryClient()

  const initialState = {
    openUploadCoverPhotoModal: false
  }

  const [{ openUploadCoverPhotoModal }, dispatchState] = useReducer(
    reducer,
    initialState
  )

  const handleUpdateCoverPhoto = async (e: any, coverPhoto: string) => {
    try {
      const { status, data } = await axios.patch('/api/update-cover-photo', {
        coverPhoto
      })

      if (status === 200) {
        setUser(deJSONify(data))
        await queryClient.invalidateQueries({ queryKey: ['user'] })
        const username =
          data?.username || useUserStore.getState().user?.username
        if (username) {
          await queryClient.invalidateQueries({ queryKey: ['user', username] })
          await queryClient.invalidateQueries({
            queryKey: ['profileUser', username]
          })
        }
        await queryClient.invalidateQueries({ queryKey: ['posts'] })
        toast.success('Cover photo updated successfully')
        dispatchState({ openUploadCoverPhotoModal: false })
      }
    } catch (error) {
      console.error('Error updating cover photo:', error)
      toast.error('Failed to update cover photo')
    }
  }

  return (
    <Fragment>
      <UploadCoverPhoto
        coverPhoto={coverPhoto}
        show={openUploadCoverPhotoModal}
        close={() => dispatchState({ openUploadCoverPhotoModal: false })}
        setCoverPhoto={(coverPhoto: string, e: any) =>
          handleUpdateCoverPhoto(e, coverPhoto)
        }
      />

      <button
        onClick={() => dispatchState({ openUploadCoverPhotoModal: true })}
        className="absolute right-2.5 bottom-2.5 hidden h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#D9D9D9] shadow-md group-hover:flex md:h-9 md:w-9"
      >
        <FaCamera className="text-[8px] text-black md:text-sm" />
      </button>
    </Fragment>
  )
}

export default CoverPhotoHover
