import {
  forwardRef,
  ForwardRefRenderFunction,
  Fragment,
  InputHTMLAttributes
} from 'react'
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Transition
} from '@headlessui/react'
import { HiChevronDown } from 'react-icons/hi2'

interface ComboBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  options: string[]
  label?: string
  onChange: (e: any) => void
  value: string
}

const ComboBox: ForwardRefRenderFunction<HTMLInputElement, ComboBoxProps> = (
  { options, label, onChange, value, ...props },
  ref
) => {
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(value.toLowerCase())
  )

  return (
    <div className="mb-4 flex w-full flex-col">
      {label && <label className="mb-1 text-sm">{label}</label>}
      <Combobox as="div" className="relative z-50">
        <div className="relative w-full cursor-default overflow-hidden">
          <ComboboxInput
            ref={ref}
            {...props}
            className="h-8 w-full rounded border border-solid border-slate-200 px-4 py-1.5 text-sm hover:border-slate-300 focus:border-indigo-300 focus:outline-none active:border-indigo-300"
            onChange={(e) => onChange(e)}
            value={value}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
            <HiChevronDown
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </ComboboxButton>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ComboboxOptions
            as="ul"
            className="absolute max-h-60 w-full overflow-y-auto rounded border border-solid border-slate-200 bg-white py-2 text-sm shadow-lg"
          >
            {filteredOptions.length === 0 && value !== '' ? (
              <li className="px-4 py-2 text-gray-700">Nothing found.</li>
            ) : (
              filteredOptions.map((option) => (
                <ComboboxOption key={option} value={option}>
                  {({ active, selected }) => (
                    <li
                      className={`cursor-pointer px-4 py-2 ${
                        active ? 'bg-sky-600 text-white' : ''
                      } ${selected ? 'font-medium' : ''}`}
                    >
                      {option}
                    </li>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </Transition>
      </Combobox>
    </div>
  )
}

ComboBox.displayName = 'ComboBox'

export default forwardRef(ComboBox)
