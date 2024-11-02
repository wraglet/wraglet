import axios from 'axios'

export const deleteImageFromR2 = async (postImage: string) => {
  try {
    await axios.delete('/api/upload', {
      data: { url: postImage }
    })
  } catch (error) {
    console.error('Failed to delete old image:', error)
  }
}

export const uploadImageToR2 = async (
  image: string,
  type: 'profilePicture' | 'coverPhoto' | 'image'
) => {
  const base64Pattern = /^data:image\/\w+;base64,/
  if (!base64Pattern.test(image)) {
    throw new Error('Invalid base64 string')
  }

  try {
    // Convert base64 string to Blob
    const byteString = atob(image.split(',')[1])
    const mimeString = image.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    const blob = new Blob([ab], { type: mimeString })

    const formData = new FormData()
    formData.append('file', blob)
    formData.append('type', type)

    const response = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data.url
  } catch (error) {
    throw new Error('Failed to convert base64 string to Blob')
  }
}
