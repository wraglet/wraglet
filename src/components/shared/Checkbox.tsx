import React, { InputHTMLAttributes } from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  ref?: React.Ref<HTMLInputElement>
}

const Checkbox = ({ label, ref, ...props }: CheckboxProps) => {
  return (
    <div className="inline-flex items-center space-x-3">
      <label
        className="relative flex cursor-pointer items-center rounded-full"
        data-ripple-dark="true"
        htmlFor={props.id}
      >
        <input
          {...props}
          type="checkbox"
          ref={ref}
          className="before:content[''] peer border-blue-gray-200 before:bg-blue-gray-500 relative h-4 w-4 cursor-pointer appearance-none rounded-md border transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-8 before:w-8 before:-translate-x-2/4 before:-translate-y-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-blue-500 checked:bg-blue-500 checked:before:bg-blue-500 hover:before:opacity-10"
        />
        <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            ></path>
          </svg>
        </div>
      </label>
      {label && (
        <label
          className="mt-px cursor-pointer text-sm font-light text-gray-700 select-none"
          htmlFor={props.id}
        >
          {label}
        </label>
      )}
    </div>
  )
}

Checkbox.displayName = 'Checkbox'

export default Checkbox
