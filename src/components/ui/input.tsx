import { forwardRef, ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, type, error, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)

    const togglePasswordVisibility = () => {
      setIsPasswordVisible((prev) => !prev)
    }

    return (
      <div className={`flex w-full flex-col`}>
        {label && (
          <label className="mb-0.5 pl-1 text-sm text-slate-600">{label}</label>
        )}
        <div className="relative flex items-center">
          <input
            {...props}
            type={type === 'password' && isPasswordVisible ? 'text' : type}
            className={cn(
              'flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:file:text-neutral-50 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300',
              'h-8 rounded border border-solid border-slate-200 px-4 py-1.5 pr-10 text-xs hover:border-slate-300 focus:border-indigo-300 focus:outline-hidden active:border-indigo-300',
              error && 'border-red-500'
            )}
            ref={ref}
          />
          {type === 'password' && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {isPasswordVisible ? <HiOutlineEye /> : <HiOutlineEyeSlash />}
            </button>
          )}
          {icon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
              {icon}
            </div>
          )}
        </div>
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
