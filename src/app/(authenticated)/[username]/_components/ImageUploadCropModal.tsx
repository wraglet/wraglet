import { FC, useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import getCroppedImg from '@/lib/getCroppedImg'
import { useDropzone } from 'react-dropzone'
import Cropper from 'react-easy-crop'

import Modal from '@/components/Modal'

interface ImageUploadCropModalProps {
  show: boolean
  close: () => void
  title: string
  description: string
  defaultImage: string
  image?: string
  aspect: number
  cropShape: 'rect' | 'round'
  previewStyle: 'rect' | 'circle'
  minWidth: number
  minHeight: number
  onCrop: (croppedImage: string, e: any) => void
  apiLabel: string
}

const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4MB

const ImageUploadCropModal: FC<ImageUploadCropModalProps> = ({
  show,
  close,
  title,
  description,
  defaultImage,
  image,
  aspect,
  cropShape,
  previewStyle,
  minWidth,
  minHeight,
  onCrop,
  apiLabel
}) => {
  const initialImage = image || defaultImage
  const [imageSrc, setImageSrc] = useState<string>(initialImage)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'select' | 'crop'>('select')
  const [limitErr, setLimitErr] = useState<string | null>(null)
  const [imageTooSmall, setImageTooSmall] = useState(false)

  useEffect(() => {
    setImageSrc(initialImage)
  }, [image, defaultImage, initialImage])

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        if (file.size > MAX_FILE_SIZE) {
          setLimitErr('File size exceeds the 4MB limit.')
          return
        }
        const reader = new FileReader()
        reader.onload = () => {
          const img = new window.Image()
          img.onload = () => {
            if (img.width < minWidth || img.height < minHeight) {
              setImageTooSmall(true)
            } else {
              setImageTooSmall(false)
            }
            setImageSrc(reader.result as string)
            setStep('crop')
            setLimitErr(null)
          }
          img.src = reader.result as string
        }
        reader.readAsDataURL(file)
      }
    },
    [minWidth, minHeight]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    noClick: false
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.size > MAX_FILE_SIZE) {
        setLimitErr('File size exceeds the 4MB limit.')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const img = new window.Image()
        img.onload = () => {
          if (img.width < minWidth || img.height < minHeight) {
            setImageTooSmall(true)
          } else {
            setImageTooSmall(false)
          }
          setImageSrc(reader.result as string)
          setStep('crop')
          setLimitErr(null)
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCrop = async (e: any) => {
    if (!imageSrc || !croppedAreaPixels) return
    setLoading(true)
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        minWidth,
        minHeight
      )
      onCrop(croppedImage, e)
      close()
    } catch (err) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep('select')
    setImageSrc(initialImage)
    setZoom(1)
    setRotation(0)
  }

  return (
    <Modal isOpen={show} onClose={close} title={title}>
      <div
        className={`flex w-full flex-col items-center gap-4 p-2 ${aspect > 2 ? 'max-w-2xl' : 'max-w-md'}`}
      >
        <p className="mb-2 text-sm text-gray-500">{description}</p>
        {step === 'select' && (
          <>
            <div className="mb-4 flex w-full justify-center">
              <div
                className={
                  previewStyle === 'circle'
                    ? 'overflow-hidden rounded-full border border-dashed border-gray-300'
                    : 'overflow-hidden rounded-md border border-dashed border-gray-300'
                }
                style={
                  previewStyle === 'circle'
                    ? { width: 160, height: 160, background: '#eee' }
                    : {
                        width: '100%',
                        maxWidth: 600,
                        height: 180,
                        background: '#eee'
                      }
                }
              >
                <Image
                  src={imageSrc}
                  alt="Preview"
                  width={previewStyle === 'circle' ? 160 : 600}
                  height={previewStyle === 'circle' ? 160 : 180}
                  className="h-full w-full object-cover"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
            <div
              {...getRootProps()}
              className={`w-full cursor-pointer rounded-lg border-2 border-dashed p-4 text-center ${isDragActive ? 'border-sky-500 bg-sky-50' : 'border-sky-300 bg-white'}`}
            >
              <input {...getInputProps()} onChange={handleFileChange} />
              <p className="font-medium text-sky-600">
                Drop your image here or{' '}
                <span className="cursor-pointer underline">browse</span>
              </p>
              <p className="text-xs text-gray-400">Maximum size: 4MB</p>
              {limitErr && (
                <p className="mt-1 text-xs text-red-500">{limitErr}</p>
              )}
              {imageTooSmall && (
                <div className="text-xs text-red-600">
                  For best results, upload an image at least {minWidth}x
                  {minHeight} pixels. Your image may appear blurry.
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                onClick={close}
              >
                Cancel
              </button>
              <button
                className="rounded bg-sky-600 px-4 py-2 text-white disabled:opacity-60"
                onClick={() => setStep('crop')}
                disabled={imageSrc === defaultImage}
              >
                Crop Image
              </button>
            </div>
          </>
        )}
        {step === 'crop' && (
          <>
            <div className="flex w-full flex-col items-center">
              <div
                className="relative flex w-full justify-center"
                style={
                  aspect > 2
                    ? { height: 220, background: '#222', maxWidth: 600 }
                    : { height: 220, background: '#222' }
                }
              >
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspect}
                  cropShape={cropShape}
                  showGrid={cropShape === 'rect'}
                  minZoom={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                  restrictPosition={false}
                />
              </div>
              <div
                className={`mt-4 flex w-full flex-col ${aspect > 2 ? 'max-w-lg' : 'max-w-xs'}`}
              >
                <label className="mb-1 text-xs font-medium">
                  Zoom:{' '}
                  <span className="font-mono">{Math.round(zoom * 100)}%</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="mb-2 w-full accent-sky-600"
                />
                <label className="mb-1 text-xs font-medium">
                  Rotation: <span className="font-mono">{rotation}°</span>
                </label>
                <input
                  type="range"
                  min={-45}
                  max={45}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                className="rounded bg-sky-600 px-4 py-2 text-white disabled:opacity-60"
                onClick={handleCrop}
                disabled={loading}
              >
                {loading ? 'Processing...' : apiLabel}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default ImageUploadCropModal
