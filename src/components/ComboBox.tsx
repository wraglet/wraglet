import {
  forwardRef,
  ForwardRefRenderFunction,
  InputHTMLAttributes,
  Fragment
} from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { HiChevronDown } from 'react-icons/hi2';

interface ComboBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  options: string[];
  label?: string;
  onChange: (e: any) => void;
  value: string;
}

const ComboBox: ForwardRefRenderFunction<HTMLInputElement, ComboBoxProps> = (
  { options, label, onChange, value, ...props },
  ref
) => {
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className='flex flex-col mb-4 w-full'>
      {label && <label className='mb-1 text-sm'>{label}</label>}
      <Combobox as='div' className='relative z-50'>
        <div className='relative w-full cursor-default overflow-hidden'>
          <Combobox.Input
            ref={ref}
            {...props}
            className='hover:border-slate-300 focus:border-indigo-300 h-8 w-full border border-solid border-slate-200 rounded py-1.5 px-4 text-sm active:border-indigo-300 focus:outline-none'
            onChange={(e) => onChange(e)}
            value={value}
          />
          <Combobox.Button className='absolute inset-y-0 right-0 flex items-center pr-2'>
            <HiChevronDown
              className='h-5 w-5 text-gray-400'
              aria-hidden='true'
            />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave='transition ease-in duration-100'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <Combobox.Options
            as='ul'
            className='absolute max-h-60 w-full py-2 bg-white border border-solid overflow-y-auto border-slate-200 rounded shadow-lg text-sm'
          >
            {filteredOptions.length === 0 && value !== '' ? (
              <li className='px-4 py-2 text-gray-700'>Nothing found.</li>
            ) : (
              filteredOptions.map((option) => (
                <Combobox.Option key={option} value={option}>
                  {({ active, selected }) => (
                    <li
                      className={`cursor-pointer px-4 py-2 ${
                        active ? 'bg-sky-600 text-white' : ''
                      } ${selected ? 'font-medium' : ''}`}
                    >
                      {option}
                    </li>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </Combobox>
    </div>
  );
};

ComboBox.displayName = 'ComboBox';

export default forwardRef(ComboBox);
