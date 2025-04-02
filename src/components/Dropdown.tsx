import {
  forwardRef,
  ForwardRefRenderFunction,
  SelectHTMLAttributes
} from 'react';

interface DropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: string[];
  label?: string;
}

const Dropdown: ForwardRefRenderFunction<HTMLSelectElement, DropdownProps> = (
  { options, label, ...props },
  ref
) => {
  return (
    <div className='flex flex-col mb-4 w-full'>
      {label && <label className='mb-1 text-sm'>{label}</label>}
      <select
        ref={ref}
        {...props}
        className='hover:border-slate-300 focus:border-indigo-300 h-8 w-full border border-solid border-slate-200 rounded py-1.5 px-4 text-sm active:border-indigo-300 focus:outline-hidden'
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

Dropdown.displayName = 'Dropdown';

export default forwardRef(Dropdown);
