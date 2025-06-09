'use client'

import { Key } from 'react'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'

interface PostImagesProps {
  images: {
    url: string | StaticImport
    key: string
  }[]
}

const PostImages = ({ images }: PostImagesProps) => {
  if (!images || images.length === 0) return null

  return (
    <div className="grid gap-2">
      {images.map(
        (
          image: { key: Key | null | undefined; url: string | StaticImport },
          index: number
        ) => (
          <div
            key={image.key || `image-${index}`}
            className="block overflow-hidden rounded-md"
          >
            <Image
              src={image.url}
              alt="Post Image"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              width={1}
              height={1}
              style={{
                height: 'auto',
                width: '100%'
              }}
            />
          </div>
        )
      )}
    </div>
  )
}

export default PostImages
