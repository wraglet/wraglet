import { FC, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions
} from '@headlessui/react'
import { HiCheck, HiChevronUpDown } from 'react-icons/hi2'

export type ListProps = {
  val: string
  name: string
}

interface ListBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  options:
    | {
        val: string
        name: string
      }[]
    | string[]
  setSelected: (val: string | ListProps) => void
  selected: string | ListProps
  label?: string
}

const ListBox: FC<ListBoxProps> = ({
  options,
  selected,
  setSelected,
  label
}) => {
  return (
    <div className="flex w-full flex-col">
      {label && (
        <label className="mb-1 block text-sm text-slate-600">{label}</label>
      )}
      <Listbox value={selected} onChange={(val) => setSelected(val)}>
        <div className="relative">
          <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pr-10 pl-3 text-left shadow-md focus:outline-hidden focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <span className="block truncate">
              {typeof selected === 'object' ? selected.name : selected}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <HiChevronUpDown
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </ListboxButton>
          <ListboxOptions
            portal
            transition
            anchor={{ to: 'bottom start', gap: '0.25rem', padding: '0.5rem' }}
            className="z-[100] max-h-60 max-w-[calc(100vw-1rem)] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden sm:text-sm"
          >
            {options.map((option) => {
              const optionKey = typeof option === 'object' ? option.val : option
              return (
                <ListboxOption
                  key={optionKey}
                  className={({ focus }) =>
                    [
                      'relative cursor-default py-2 pr-4 pl-10 select-none',
                      focus ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                    ].join(' ')
                  }
                  value={typeof option === 'object' ? option.name : option}
                >
                  {({ selected: isOptionSelected }) => (
                    <>
                      <span
                        className={cn(
                          'block truncate',
                          isOptionSelected ? 'font-medium' : 'font-normal'
                        )}
                      >
                        {typeof option === 'object' ? option.name : option}
                      </span>
                      {isOptionSelected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                          <HiCheck className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </ListboxOption>
              )
            })}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  )
}

export default ListBox
