import {
  CSSProperties,
  FC,
  Fragment,
  MouseEvent,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import Image from 'next/image'
import getCroppedImg from '@/lib/getCroppedImg'
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild
} from '@headlessui/react'
import { PhotoIcon } from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'
import Cropper from 'react-easy-crop'
import { FaCrop } from 'react-icons/fa6'

import { MAX_FILE_SIZE } from '@/data/constants'
import CrossWhite from '@/components/shared/CrossWhite'
import { Skeleton } from '@/components/shared/Skeleton'
import { Slider } from '@/components/shared/Slider'
import ThreeCardsImage from '@/components/shared/ThreeCardsImage'

type Props = {
  postImage: string
  show: boolean
  close: () => void
  setPostImage: (postImage: string) => void
}

const baseStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  height: '200px',
  borderWidth: 2,
  borderRadius: 8,
  borderColor: '#0ea5e9',
  borderStyle: 'dashed',
  backgroundColor: 'white',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out'
}

const focusedStyle: CSSProperties = {
  borderColor: '#0EA5E9'
}

const acceptStyle: CSSProperties = {
  borderColor: '#00e676'
}

const rejectStyle: CSSProperties = {
  borderColor: '#ff1744'
}

const UploadPostImage: FC<Props> = ({
  postImage,
  show,
  close,
  setPostImage
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<string>(postImage)
  const trimmedImage = image.trim()
  const hasImage = trimmedImage.length > 0
  const trimmedPost = postImage.trim()
  const isValid = hasImage && trimmedImage !== trimmedPost

  useEffect(() => {
    setImage(postImage)
  }, [postImage])

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<null | {
    x: number
    y: number
    width: number
    height: number
  }>(null)
  const canApplyCrop = hasImage && croppedAreaPixels !== null
  const [limitErr, setLimitErr] = useState<string | null>(null)

  const onCropComplete = useCallback(
    (
      croppedArea: any,
      croppedAreaPixels: { x: number; y: number; width: number; height: number }
    ) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const [isCropping, setIsCropping] = useState(false)

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.addEventListener(
        'load',
        () => resolve(reader.result as string),
        false
      )
      reader.readAsDataURL(file)
    })
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const processFiles = async () => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        if (MAX_FILE_SIZE < file.size) {
          setLimitErr('File size exceeds the 4MB limit.')
          return
        }
        const imageDataUrl = await readFile(file)
        setImage(imageDataUrl)
        setLimitErr(null)
      }
    }
    processFiles()
  }, [])

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({ onDrop, accept: { 'image/*': [] } })

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {})
    }),
    [isFocused, isDragAccept, isDragReject]
  )

  const handleCrop = async () => {
    if (!trimmedImage || !croppedAreaPixels) return
    const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation)
    setImage(croppedImage)
    setIsCropping(false)
  }

  const handleConfirm = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!trimmedImage) return
    setPostImage(trimmedImage)
    close()
  }

  const handleClose = () => {
    setImage(postImage)
    setIsCropping(false)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)
    setLimitErr(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    close()
  }

  const renderImagePreviewSection = () => {
    if (isCropping) {
      return (
        <div className="relative h-64 w-full">
          <Cropper
            image={trimmedImage}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={16 / 9}
            cropShape={'rect'}
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>
      )
    }

    if (hasImage) {
      return (
        <div className="block h-64 w-full overflow-hidden rounded-lg border border-sky-100 bg-neutral-50 shadow-sm">
          <Suspense fallback={<Skeleton className="h-full w-full bg-white" />}>
            <Image
              src={trimmedImage}
              alt="Post image preview"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              width={800}
              height={450}
              className="h-full max-h-64 w-full object-contain object-center"
              unoptimized={
                trimmedImage.startsWith('data:') ||
                trimmedImage.startsWith('blob:')
              }
            />
          </Suspense>
        </div>
      )
    }

    return (
      <div
        className="flex h-56 w-full flex-col items-center justify-center rounded-lg border border-dashed border-sky-200/80 bg-sky-50/40 px-4 text-center"
        aria-hidden
      >
        <PhotoIcon className="mb-2 h-12 w-12 text-sky-400" />
        <p className="text-sm font-medium text-gray-700">
          No image selected yet
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Add a photo below to preview it here
        </p>
      </div>
    )
  }

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog
        as="div"
        className="relative inset-0 z-10"
        ref={dialogRef}
        onClose={handleClose}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm"></div>
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto p-4">
            <div className="relative grid max-h-[min(90dvh,100%)] w-full max-w-lg gap-4 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-4 shadow-xl sm:p-5">
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-3 right-3 rounded-full p-1.5 hover:bg-slate-100"
                aria-label="Close upload image"
              >
                <CrossWhite fill="#374151" />
              </button>
              <div>
                <h1 className="text-base font-semibold text-gray-900">
                  Upload Image
                </h1>
                <p className="text-sm font-medium text-slate-400">
                  Choose an image to include to your post
                </p>
              </div>
              {renderImagePreviewSection()}

              {!isCropping ? (
                <button
                  type="button"
                  onClick={() => setIsCropping(true)}
                  disabled={!hasImage}
                  className="text-primary flex items-center gap-x-2 hover:enabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaCrop size={16} />
                  &nbsp;
                  <span className="text-sm font-bold">Crop Image</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCropping(false)}
                  className="flex items-center gap-x-2"
                >
                  <span className="text-primary text-sm font-bold hover:text-gray-500">
                    Back
                  </span>
                </button>
              )}

              {isCropping ? (
                <div className="flex h-[200px] flex-col justify-center gap-y-6">
                  <div className="flex flex-col gap-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-black">
                        Zoom
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {(((zoom - 1) / 2) * 100).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Slider
                        min={1}
                        max={3}
                        step={0.1}
                        value={[zoom]}
                        onValueChange={(value) => setZoom(value[0])}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-black">
                        Rotation
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {rotation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Slider
                        min={0}
                        max={360}
                        step={1}
                        value={[rotation]}
                        onValueChange={(value) => setRotation(value[0])}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  {...getRootProps({ style })}
                  className="grid place-items-center gap-5"
                >
                  <div className="grid place-items-center">
                    <ThreeCardsImage />
                    <div className="text-primary text-base font-medium">
                      Drop your files here or{' '}
                      <label
                        htmlFor="file"
                        className="cursor-pointer text-sky-500 hover:text-sky-600"
                      >
                        <input
                          {...getInputProps()}
                          ref={fileInputRef}
                          type="file"
                          name="file"
                          accept="image/png, image/jpeg"
                          id="file"
                          className="hidden"
                        />
                        <span>browse</span>
                      </label>
                    </div>
                    <span className="text-sm font-medium text-slate-400">
                      Maximum size: 4MB
                    </span>
                    {limitErr && (
                      <span className="text-sm font-medium text-red-500">
                        {limitErr}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-md border border-solid border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-xs hover:bg-slate-100 active:bg-slate-200"
                >
                  Cancel
                </button>
                {isCropping ? (
                  <button
                    onClick={handleCrop}
                    type="button"
                    className={`${
                      canApplyCrop
                        ? 'border-sky-500 bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700'
                        : 'pointer-events-none cursor-default border-gray-200 bg-slate-200 text-slate-400 select-none'
                    } rounded-md border border-solid px-3 py-1.5 text-sm font-medium shadow-sm transition-all`}
                  >
                    Crop
                  </button>
                ) : (
                  <button
                    type="submit"
                    onClick={handleConfirm}
                    disabled={!isValid}
                    className={`${
                      isValid
                        ? 'border-sky-500 bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700'
                        : 'pointer-events-none cursor-default border-gray-200 bg-slate-200 text-slate-400 select-none'
                    } rounded-md border border-solid px-3 py-1.5 text-sm font-medium shadow-sm transition-all`}
                  >
                    Confirm
                  </button>
                )}
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  )
}

export default UploadPostImage
