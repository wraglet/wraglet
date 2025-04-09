import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import User, { IUserDocument } from '@/models/User'
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { v4 as uuidv4 } from 'uuid'

export const PATCH = async (request: Request) => {
  const s3Client = new S3Client({
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    region: 'auto',
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY ?? ''
    }
  })

  try {
    await client()

    const body = await request.json()
    const currentUser = await getCurrentUser()
    const { profilePicture } = body

    // Decode base64 image data
    const base64Data = Buffer.from(
      profilePicture.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    )
    const type = profilePicture.split(';')[0].split('/')[1]

    // Remove the existing profile picture from R2 before uploading the new/updated image
    if (currentUser?.profilePicture?.key) {
      const deleteParams = {
        Bucket: process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME ?? '',
        Key: `user/${currentUser.profilePicture.key}`
      }

      await s3Client.send(new DeleteObjectCommand(deleteParams))
    }

    // Upload the new profile picture to R2
    const key = `avatars/${uuidv4()}.${type}`
    const uploadFile = async (
      key: string,
      body: Buffer,
      contentType: string
    ) => {
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME ?? '',
          Key: key,
          Body: body,
          ContentType: contentType
        }
      })

      upload.on('httpUploadProgress', (progress) => {
        console.log(progress)
      })

      await upload.done()
    }

    await uploadFile(key, base64Data, `image/${type}`)
    const url = `${process.env.NEXT_PUBLIC_R2_USERS_URL}/${key}`

    // Update user's profilePicture in MongoDB - use IUserDocument for DB operations
    const updatedUser = (await User.findByIdAndUpdate(
      currentUser?._id,
      { $set: { profilePicture: { url, key } } },
      { new: true }
    )) as IUserDocument

    // Return IUser (without hashedPassword) for the response
    revalidatePath(`/${currentUser?.username}`)
    return NextResponse.json(
      updatedUser.toObject ? updatedUser.toObject() : updatedUser
    )
  } catch (err) {
    console.log('Update profile picture error: ', err)
    console.error(
      'Error happened while doing PATCH for /api/update-avatar at route.ts: ',
      err
    )
    return new NextResponse('Internal Error: ', { status: 500 })
  }
}
