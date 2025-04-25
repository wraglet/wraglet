import { Area } from 'react-easy-crop'

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

const getRadianAngle = (degreeValue: number) => (degreeValue * Math.PI) / 180

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  outputWidth?: number,
  outputHeight?: number
): Promise<string> {
  const image = await createImage(imageSrc)

  // Create a canvas that will fit the rotated image
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // Calculate bounding box of the rotated image
  const radians = getRadianAngle(rotation)
  const sin = Math.abs(Math.sin(radians))
  const cos = Math.abs(Math.cos(radians))
  const bBoxWidth = image.width * cos + image.height * sin
  const bBoxHeight = image.width * sin + image.height * cos

  // Draw the rotated image onto a temp canvas
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = bBoxWidth
  tempCanvas.height = bBoxHeight
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) return ''

  // Move to center, rotate, then draw
  tempCtx.save()
  tempCtx.translate(bBoxWidth / 2, bBoxHeight / 2)
  tempCtx.rotate(radians)
  tempCtx.drawImage(image, -image.width / 2, -image.height / 2)
  tempCtx.restore()

  // Now crop the desired area from the rotated image
  const finalWidth = outputWidth || pixelCrop.width
  const finalHeight = outputHeight || pixelCrop.height
  canvas.width = finalWidth
  canvas.height = finalHeight

  ctx.drawImage(
    tempCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    finalWidth,
    finalHeight
  )

  return canvas.toDataURL('image/jpeg')
}
