import { ForwardRefRenderFunction, Fragment, InputHTMLAttributes } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { HiCheck, HiChevronUpDown } from 'react-icons/hi2';

export type ListProps = {
  val: string;
  name: string;
};

interface ListBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  options:
    | {
        val: string;
        name: string;
      }[]
    | string[];
  setSelected: (val: string | ListProps) => void;
  selected: string | ListProps;
  label?: string;
}

const ListBox: ForwardRefRenderFunction<HTMLInputElement, ListBoxProps> = ({
  options,
  selected,
  setSelected,
  label
}) => {
  return (
    <div className='flex flex-col w-full'>
      {label && (
        <label className='block text-sm text-slate-600 mb-1'>{label}</label>
      )}
      <Listbox value={selected} onChange={(val) => setSelected(val)}>
        <div className='relative'>
          <Listbox.Button className='relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm'>
            <span className='block truncate'>
              {typeof selected === 'object' ? selected.name : selected}
            </span>
            <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
              <HiChevronUpDown
                className='h-5 w-5 text-gray-400'
                aria-hidden='true'
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Listbox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-30'>
              {options.map((option, i) => (
                <Listbox.Option
                  key={i}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                    }`
                  }
                  value={typeof option === 'object' ? option.name : option}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {typeof option === 'object' ? option.name : option}
                      </span>
                      {selected ? (
                        <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600'>
                          <HiCheck className='h-5 w-5' aria-hidden='true' />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default ListBox;
