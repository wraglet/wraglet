import { revalidatePath } from 'next/cache'
import { after, NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import {
  triggerImageModeration,
  uploadImageToQuarantine
} from '@/lib/media/uploadToR2'
import User from '@/models/User'

export const PATCH = async (request: Request) => {
  try {
    await client()
    const currentUser = await getCurrentUser()

    if (!currentUser?._id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { photos, action } = body

    if (action === 'update') {
      const updatedUser = await User.findByIdAndUpdate(
        currentUser._id,
        { $set: { photoCollection: photos } },
        { new: true }
      ).select('-hashedPassword')

      if (currentUser.username) {
        revalidatePath(`/${currentUser.username}`)
      }
      return NextResponse.json(updatedUser)
    }

    if (action === 'upload') {
      const { image } = body

      if (typeof image !== 'string' || !image.startsWith('data:image/')) {
        return new NextResponse('Invalid image', { status: 400 })
      }

      const user = await User.findById(currentUser._id)
      if (!user) {
        return new NextResponse('User not found', { status: 404 })
      }

      const currentPhotoCount = user.photoCollection?.length || 0
      if (currentPhotoCount >= 9) {
        return new NextResponse('Photo collection limit reached', {
          status: 400
        })
      }

      const uploaded = await uploadImageToQuarantine({
        dataUrl: image,
        surface: 'gallery',
        userId: currentUser._id.toString(),
        publicPrefix: 'gallery'
      })

      if (uploaded.moderationStatus === 'pending') {
        await User.findByIdAndUpdate(currentUser._id, {
          $set: { 'pendingMedia.galleryKey': uploaded.quarantineKey }
        })
        after(() =>
          triggerImageModeration({
            quarantineKey: uploaded.quarantineKey,
            surface: 'gallery',
            userId: currentUser._id.toString()
          })
        )
        return NextResponse.json(
          { error: 'Photo is processing moderation review' },
          { status: 202 }
        )
      }

      if (!uploaded.url || !uploaded.key) {
        return new NextResponse('Failed to upload photo', { status: 500 })
      }

      const newPhoto = {
        url: uploaded.url,
        key: uploaded.key,
        type: 'post' as const,
        createdAt: new Date()
      }

      await User.findByIdAndUpdate(
        currentUser._id,
        { $push: { photoCollection: newPhoto } },
        { new: true }
      )

      if (currentUser.username) {
        revalidatePath(`/${currentUser.username}`)
      }
      return NextResponse.json(newPhoto)
    }

    return new NextResponse('Invalid action', { status: 400 })
  } catch (error) {
    console.error('Error updating photo collection:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
