import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import User from '@/models/User'
import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { v4 as uuidv4 } from 'uuid'

const s3Client = new S3Client({
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY ?? ''
  }
})

export async function PATCH(request: Request) {
  try {
    await client()
    const currentUser = await getCurrentUser()

    if (!currentUser?._id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { photos, action } = body

    if (action === 'update') {
      // Update the user's photo collection
      const updatedUser = await User.findByIdAndUpdate(
        currentUser._id,
        { $set: { photoCollection: photos } },
        { new: true }
      ).select('-hashedPassword')

      revalidatePath(`/${currentUser.username}`)
      return NextResponse.json(updatedUser)
    } else if (action === 'upload') {
      const { image } = body

      // Decode base64 image data
      const base64Data = Buffer.from(
        image.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      )
      const type = image.split(';')[0].split('/')[1]

      // Upload to R2
      const key = `photos/${uuidv4()}.${type}`
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME ?? '',
          Key: key,
          Body: base64Data,
          ContentType: `image/${type}`
        }
      })

      await upload.done()
      const url = `${process.env.NEXT_PUBLIC_R2_USERS_URL}/${key}`

      // Add to user's photo collection
      const newPhoto = {
        url,
        key,
        type: 'post',
        createdAt: new Date()
      }

      // Get current user to check photo collection length
      const user = await User.findById(currentUser._id)
      if (!user) {
        return new NextResponse('User not found', { status: 404 })
      }

      // Check if photo collection exists and its length
      const currentPhotoCount = user.photoCollection?.length || 0
      if (currentPhotoCount >= 9) {
        return new NextResponse('Photo collection limit reached', {
          status: 400
        })
      }

      const updatedUser = await User.findByIdAndUpdate(
        currentUser._id,
        { $push: { photoCollection: newPhoto } },
        { new: true }
      ).select('-hashedPassword')

      revalidatePath(`/${currentUser.username}`)
      return NextResponse.json(newPhoto)
    }

    return new NextResponse('Invalid action', { status: 400 })
  } catch (error) {
    console.error('Error updating photo collection:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
