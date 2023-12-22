import React, {
  Fragment,
  useRef,
  DragEvent,
  FC,
  useState,
  ChangeEvent
} from 'react';
import Resizer from 'react-image-file-resizer';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import CrossWhite from './CrossWhite';
import ThreeCardsImage from './ThreeCardsImage';

type Props = {
  postImage: string;
  show: boolean;
  close: () => void;
  setPostImage: (postImage: string, e: any) => void;
};

const UploadPostImage: FC<Props> = ({
  postImage,
  show,
  close,
  setPostImage
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<string>(postImage);
  const [isDragged, setIsDragged] = useState(false);

  const isValid = image !== '' && image !== postImage;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragged(true);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragged(false);

    if (e.dataTransfer.files.length > 0) {
      Resizer.imageFileResizer(
        e.dataTransfer.files[0],
        700,
        700,
        'JPEG',
        100,
        0,
        (uri: any) => {
          setImage(uri);
        },
        'base64'
      );
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      Resizer.imageFileResizer(
        e.target.files[0],
        700,
        700,
        'JPEG',
        100,
        0,
        (uri: any) => {
          setImage(uri);
        },
        'base64'
      );
    }
  };

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog
        as='div'
        className='relative inset-0 z-10'
        ref={dialogRef}
        onClose={close}
      >
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25'></div>
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0 scale-95'
          enterTo='opacity-100 scale-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100 scale-100'
          leaveTo='opacity-0 scale-95'
        >
          <Dialog.Panel className='fixed inset-0 z-10 flex items-center justify-center'>
            <div className='relative grid w-[530px] gap-5 rounded-2xl bg-white p-10'>
              <button
                onClick={close}
                className='absolute right-6 top-6 rounded-md p-1 hover:bg-slate-100'
              >
                <CrossWhite fill='#374151' />
              </button>
              <div>
                <h1 className='text-xl font-bold text-primary'>Upload Image</h1>
                <p className='text-sm font-medium text-slate-400'>
                  Choose an image to include to your post
                </p>
              </div>
              <div className='block overflow-hidden'>
                <Image
                  src={image || '/images/placeholder/img-placeholder.png'}
                  alt='Post Image to upload'
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  width={1}
                  height={1}
                  style={{
                    height: 'auto',
                    width: '100%'
                  }}
                  className='object-cover object-center'
                />
              </div>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragLeave={() => setIsDragged(false)}
                className={`${
                  isDragged ? 'border-sky-500 bg-sky-50' : 'border-gray-200'
                } grid place-items-center gap-5 rounded-lg border-2 border-dashed py-10 transition-colors`}
              >
                <div className='grid place-items-center'>
                  <ThreeCardsImage />
                  <div className='text-base font-medium text-primary'>
                    Drop your files here or{' '}
                    <label
                      htmlFor='file'
                      className='cursor-pointer text-sky-500 hover:text-sky-600'
                    >
                      <input
                        onChange={handleFileInputChange}
                        type='file'
                        name='file'
                        accept='image/png, image/jpeg'
                        id='file'
                        className='hidden'
                      />
                      browse
                    </label>
                  </div>
                  <span className='text-sm font-medium text-slate-400'>
                    Maximum size: 4MB
                  </span>
                </div>
              </div>
              <div className='flex justify-end gap-2.5'>
                <button
                  onClick={close}
                  className='rounded-md border border-solid border-gray-200 py-1 px-3 text-base font-medium text-[#01205D] shadow-sm hover:bg-slate-100 active:bg-slate-200'
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    setPostImage(image, e);
                    close();
                  }}
                  disabled={!isValid}
                  className={`${
                    isValid
                      ? 'border-sky-500 bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700'
                      : 'pointer-events-none cursor-default select-none border-gray-200 bg-slate-200 text-slate-400'
                  } rounded-md border border-solid py-1  px-3 text-base font-medium shadow-sm  transition-all`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default UploadPostImage;
