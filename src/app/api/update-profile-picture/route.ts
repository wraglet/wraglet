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
    const { profilePicture } = body
    if (
      typeof profilePicture !== 'string' ||
      !profilePicture.startsWith('data:image/')
    ) {
      return new NextResponse('Invalid profile picture', { status: 400 })
    }

    const uploaded = await uploadImageToQuarantine({
      dataUrl: profilePicture,
      surface: 'avatars',
      userId: currentUser._id.toString()
    })

    if (uploaded.moderationStatus === 'pending') {
      await User.findByIdAndUpdate(currentUser._id, {
        $set: { 'pendingMedia.avatarKey': uploaded.quarantineKey }
      })
      after(() =>
        triggerImageModeration({
          quarantineKey: uploaded.quarantineKey,
          surface: 'avatars',
          userId: currentUser._id.toString()
        })
      )
      return NextResponse.json(
        { error: 'Profile picture is processing moderation review' },
        { status: 202 }
      )
    }

    if (!uploaded.url || !uploaded.key) {
      return new NextResponse('Failed to upload profile picture', {
        status: 500
      })
    }

    if (currentUser.profilePicture?.key) {
      await deleteR2Object(currentUser.profilePicture.key).catch((error) => {
        console.warn('Failed to delete previous profile picture:', error)
      })
    }

    const updatedUser = (await User.findByIdAndUpdate(
      currentUser._id,
      { $set: { profilePicture: { url: uploaded.url, key: uploaded.key } } },
      { new: true }
    )) as IUserDocument

    let userObj = updatedUser.toObject ? updatedUser.toObject() : updatedUser
    userObj = convertObjectIdsToStrings(userObj)
    if (currentUser.username) {
      revalidatePath(`/${currentUser.username}`)
    }
    return NextResponse.json(userObj)
  } catch (err) {
    console.error('Update profile picture error:', err)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
