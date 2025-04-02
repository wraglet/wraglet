import { NextResponse } from 'next/server'
import getCurrentUser from '@/actions/getCurrentUser'
import client from '@/lib/db'
import User, { IUserDocument } from '@/models/User'
import { ObjectCannedACL, S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { v4 as uuidv4 } from 'uuid'

export const PATCH = async (request: Request) => {
  const s3 = new S3({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID_PROD ?? '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_PROD ?? ''
    },

    region: process.env.AWS_REGION_PROD
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

    // Remove the existing profile picture from S3 before uploading the new/updated image
    if (currentUser?.profilePicture?.key) {
      const deleteParams: {
        Bucket: string
        Key: string
      } = {
        Bucket: process.env.AWS_S3_BUCKET ?? '',
        Key: `user/${currentUser.profilePicture.key}`
      }

      await s3.deleteObject(deleteParams)
    }

    // Upload the new profile picture to S3
    const key = `user/${uuidv4()}.${type}`
    const params: {
      Bucket: string
      Key: string
      Body: Buffer
      ACL: ObjectCannedACL | undefined
      ContentEncoding: string
      ContentType: string
    } = {
      Bucket: process.env.AWS_S3_BUCKET ?? '',
      Key: key,
      Body: base64Data,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: `image/${type}`
    }

    const data = await new Upload({
      client: s3,
      params
    }).done()
    console.log('AWS UPLOAD RES DATA FOR PROFILE PICTURE: ', data)

    // Update user's profilePicture in MongoDB - use IUserDocument for DB operations
    const updatedUser = (await User.findByIdAndUpdate(
      currentUser?._id,
      { $set: { profilePicture: { url: data.Location, key } } },
      { new: true }
    )) as IUserDocument

    // Return IUser (without hashedPassword) for the response
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
