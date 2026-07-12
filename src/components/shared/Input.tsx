import React, { InputHTMLAttributes, ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
  error?: string
  ref?: React.Ref<HTMLInputElement>
}

const Input = ({
  label,
  icon,
  type,
  error,
  className,
  ref,
  ...props
}: InputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const isPasswordField = type === 'password'

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev)
  }

  let effectiveInputType: InputHTMLAttributes<HTMLInputElement>['type'] = type
  if (isPasswordField) {
    effectiveInputType = isPasswordVisible ? 'text' : 'password'
  }

  const passwordFieldExtras = isPasswordField
    ? ({
        autoCapitalize: 'off',
        autoCorrect: 'off',
        spellCheck: false
      } as Pick<
        InputHTMLAttributes<HTMLInputElement>,
        'autoCapitalize' | 'autoCorrect' | 'spellCheck'
      >)
    : {}

  return (
    <div className={`flex w-full flex-col`}>
      {label && (
        <label className="mb-0.5 pl-1 text-sm text-slate-600">{label}</label>
      )}
      <div className="relative flex items-center">
        <input
          {...props}
          {...passwordFieldExtras}
          type={effectiveInputType}
          className={cn(
            'h-8 w-full rounded border border-solid border-slate-200 px-4 py-1.5 text-xs hover:border-slate-300 focus:border-indigo-300 focus:outline-hidden active:border-indigo-300',
            error && 'border-red-500',
            (isPasswordField || icon) && 'pr-10',
            className
          )}
          ref={ref}
        />
        {isPasswordField && (
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-600 hover:text-slate-900"
            onClick={togglePasswordVisibility}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isPasswordVisible}
          >
            {isPasswordVisible ? (
              <HiOutlineEyeSlash className="h-4 w-4" aria-hidden />
            ) : (
              <HiOutlineEye className="h-4 w-4" aria-hidden />
            )}
          </button>
        )}
        {icon && !isPasswordField && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

Input.displayName = 'Input'

export default Input
