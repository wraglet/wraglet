import React, {
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
import { useDropzone } from 'react-dropzone'
import Cropper from 'react-easy-crop'
import { FaCrop } from 'react-icons/fa6'

import { MAX_FILE_SIZE } from '@/data/constants'
import CrossWhite from '@/components/CrossWhite'
import ThreeCardsImage from '@/components/ThreeCardsImage'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'

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
  borderColor: '#2196f3'
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
  const [image, setImage] = useState<string>(postImage)
  const isValid = image !== '' && image !== postImage

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
    if (croppedAreaPixels) {
      const croppedImage = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation
      )
      setImage(croppedImage)
      setIsCropping(false)
    }
  }

  const handleConfirm = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setPostImage(image)
    close()
  }

  const handleClose = () => {
    setImage(postImage)
    setIsCropping(false)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)
    close()
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
          <div className="fixed inset-0 bg-black bg-opacity-25"></div>
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
          <DialogPanel className="fixed inset-0 z-10 flex items-center justify-center">
            <div className="relative grid w-[530px] gap-5 rounded-2xl bg-white p-10">
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-6 top-6 rounded-md p-1 hover:bg-slate-100"
              >
                <CrossWhite fill="#374151" />
              </button>
              <div>
                <h1 className="text-primary text-xl font-bold">Upload Image</h1>
                <p className="text-sm font-medium text-slate-400">
                  Choose an image to include to your post
                </p>
              </div>
              {!isCropping ? (
                <div className="block h-64 w-full overflow-hidden">
                  <Suspense
                    fallback={<Skeleton className="h-full w-full bg-white" />}
                  >
                    <Image
                      src={image || '/images/placeholder/img-placeholder.png'}
                      alt="Post Image to upload"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      width={1}
                      height={1}
                      style={{
                        height: 'auto',
                        width: '100%'
                      }}
                      className="object-cover object-center"
                    />
                  </Suspense>
                </div>
              ) : (
                <div className="relative h-64 w-full">
                  <Cropper
                    image={image}
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
              )}

              {!isCropping ? (
                <button
                  type="button"
                  onClick={() => setIsCropping(true)}
                  className="text-primary flex items-center gap-x-2 hover:text-gray-500"
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
                      <span className="text-xl font-medium text-black">
                        Zoom
                      </span>
                      <span className="text-xl font-bold text-gray-900">
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
                      <span className="text-xl font-medium text-black">
                        Rotation
                      </span>
                      <span className="text-xl font-bold text-gray-900">
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
                  className="rounded-md border border-solid border-gray-200 px-3 py-1 text-base font-medium text-[#01205D] shadow-sm hover:bg-slate-100 active:bg-slate-200"
                >
                  Cancel
                </button>
                {isCropping ? (
                  <button
                    onClick={handleCrop}
                    type="submit"
                    className={`${
                      isValid
                        ? 'border-sky-500 bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700'
                        : 'pointer-events-none cursor-default select-none border-gray-200 bg-slate-200 text-slate-400'
                    } rounded-md border border-solid px-3 py-1 text-base font-medium shadow-sm transition-all`}
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
                        : 'pointer-events-none cursor-default select-none border-gray-200 bg-slate-200 text-slate-400'
                    } rounded-md border border-solid px-3 py-1 text-base font-medium shadow-sm transition-all`}
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
