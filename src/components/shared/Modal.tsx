import { Fragment, ReactNode } from 'react'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild
} from '@headlessui/react'
import { HiMiniXMark } from 'react-icons/hi2'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="mx-auto max-h-[min(90dvh,100%)] w-full max-w-md transform overflow-y-auto rounded-xl border border-neutral-200 bg-white align-middle shadow-xl transition-all">
                <div className="flex w-full items-center justify-between border-b border-solid border-[#DFE4EA] px-4 py-3">
                  <DialogTitle
                    as="h3"
                    className="text-base leading-6 font-semibold text-gray-900"
                  >
                    {title}
                  </DialogTitle>

                  <button
                    type="button"
                    className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#0EA5E9]"
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <HiMiniXMark className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex w-full flex-col">{children}</div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default Modal
