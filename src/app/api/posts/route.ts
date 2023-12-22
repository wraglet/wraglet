import { NextResponse } from 'next/server';
import dbConnect from '@/libs/dbConnect';
import getCurrentUser from '@/actions/getCurrentUser';
import Post from '@/models/Post';
import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';

export const POST = async (request: Request) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_PROD,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_PROD,
    region: process.env.AWS_REGION_PROD
  });

  try {
    await dbConnect();

    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { text, audience = 'public', image } = body;

    if (!currentUser?._id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const uploadImageToS3 = async (
      image: string
    ): Promise<{ url: string; key: string }> => {
      const base64Data = Buffer.from(
        image.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      );
      const type = image.split(';')[0].split('/')[1];
      const key = `user/post/${uuidv4()}.${type}`;
      const params: {
        Bucket: string;
        Key: string;
        Body: Buffer;
        ACL: string;
        ContentEncoding: string;
        ContentType: string;
      } = {
        Bucket: process.env.AWS_S3_BUCKET || '',
        Key: key,
        Body: base64Data,
        ACL: 'public-read',
        ContentEncoding: 'base64',
        ContentType: `image/${type}`
      };
      const data = await s3.upload(params).promise();
      return { url: data.Location, key };
    };

    let content = {};

    if (text && image) {
      // Handle both text and image logic here if needed
      const imageUrl = await uploadImageToS3(image);
      content = { text, images: [imageUrl] };
    } else if (text) {
      content = { text };
    } else if (image) {
      // Handle image logic here if needed
      const imageUrl = await uploadImageToS3(image);
      content = { images: [imageUrl] };
    } else {
      return new NextResponse('Text or image is required', { status: 400 });
    }

    const newPost = await Post.create({
      content,
      audience,
      author: currentUser._id
    });

    const populatedPost = await Post.findById(newPost._id)
      .populate({
        path: 'author',
        select:
          'id firstName lastName email dob gender bio pronoun profilePicture coverPhoto createdAt updatedAt'
      })
      .exec();

    return NextResponse.json(populatedPost);
  } catch (err: any) {
    console.log('Fetching posts error: ', err);
    console.error(
      'Error happened while doing POST for /api/posts at route.ts: ',
      err
    );
    return new NextResponse('Internal Error: ', { status: 500 });
  }
};
