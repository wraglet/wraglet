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
    const { coverPhoto } = body

    // Decode base64 image data
    const base64Data = Buffer.from(
      coverPhoto.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    )
    const type = coverPhoto.split(';')[0].split('/')[1]

    // Remove the existing cover photo from R2 before uploading the new/updated image
    if (currentUser?.coverPhoto?.key) {
      const deleteParams = {
        Bucket: process.env.CLOUDFLARE_R2_USERS_BUCKET_NAME ?? '',
        Key: `coverPhotos/${currentUser.coverPhoto.key}`
      }
      await s3Client.send(new DeleteObjectCommand(deleteParams))
    }

    // Upload the new cover photo to R2
    const key = `coverPhotos/${uuidv4()}.${type}`
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

    // Update user's coverPhoto in MongoDB
    const updatedUser = (await User.findByIdAndUpdate(
      currentUser?._id,
      { $set: { coverPhoto: { url, key } } },
      { new: true }
    )) as IUserDocument

    // Convert all ObjectIds to strings recursively
    function convertObjectIdsToStrings(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(convertObjectIdsToStrings)
      } else if (obj && typeof obj === 'object') {
        const newObj: any = {}
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (
              (key === '_id' || key.endsWith('Id')) &&
              obj[key] &&
              typeof obj[key] === 'object' &&
              obj[key].toString
            ) {
              newObj[key] = obj[key].toString()
            } else {
              newObj[key] = convertObjectIdsToStrings(obj[key])
            }
          }
        }
        return newObj
      }
      return obj
    }
    let userObj = updatedUser.toObject ? updatedUser.toObject() : updatedUser
    userObj = convertObjectIdsToStrings(userObj)
    revalidatePath(`/${currentUser?.username}`)
    return NextResponse.json(userObj)
  } catch (err) {
    console.log('Update cover photo error: ', err)
    return new NextResponse('Internal Error: ', { status: 500 })
  }
}
