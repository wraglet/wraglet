import { revalidatePath } from 'next/cache'
import { after, NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import {
  deleteR2Object,
  triggerImageModeration,
  uploadImageToQuarantine
} from '@/lib/media/uploadToR2'
import User, { IUserDocument } from '@/models/User'
import { convertObjectIdsToStrings } from '@/utils/convertObjectIdsToStrings'

export const PATCH = async (request: Request) => {
  try {
    await client()

    const currentUser = await getCurrentUser()
    if (!currentUser?._id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { coverPhoto } = body
    if (
      typeof coverPhoto !== 'string' ||
      !coverPhoto.startsWith('data:image/')
    ) {
      return new NextResponse('Invalid cover photo', { status: 400 })
    }

    const uploaded = await uploadImageToQuarantine({
      dataUrl: coverPhoto,
      surface: 'covers',
      userId: currentUser._id.toString()
    })

    if (uploaded.moderationStatus === 'pending') {
      await User.findByIdAndUpdate(currentUser._id, {
        $set: { 'pendingMedia.coverKey': uploaded.quarantineKey }
      })
      after(() =>
        triggerImageModeration({
          quarantineKey: uploaded.quarantineKey,
          surface: 'covers',
          userId: currentUser._id.toString()
        })
      )
      return NextResponse.json(
        { error: 'Cover photo is processing moderation review' },
        { status: 202 }
      )
    }

    if (!uploaded.url || !uploaded.key) {
      return new NextResponse('Failed to upload cover photo', { status: 500 })
    }

    if (currentUser.coverPhoto?.key) {
      await deleteR2Object(currentUser.coverPhoto.key).catch((error) => {
        console.warn('Failed to delete previous cover photo:', error)
      })
    }

    const updatedUser = (await User.findByIdAndUpdate(
      currentUser._id,
      { $set: { coverPhoto: { url: uploaded.url, key: uploaded.key } } },
      { new: true }
    )) as IUserDocument

    let userObj = updatedUser.toObject ? updatedUser.toObject() : updatedUser
    userObj = convertObjectIdsToStrings(userObj)
    revalidatePath(`/${currentUser.username}`)
    return NextResponse.json(userObj)
  } catch (err) {
    console.error('Update cover photo error:', err)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
