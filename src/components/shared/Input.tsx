import React, {
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useState
} from 'react'
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
}

const Input = forwardRef(
  (
    { label, icon, ...props }: InputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
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
            type={
              props.type === 'password' && isPasswordVisible
                ? 'text'
                : props.type
            }
            className="h-8 w-full rounded border border-solid border-slate-200 px-4 py-1.5 pr-10 text-xs hover:border-slate-300 focus:border-indigo-300 focus:outline-hidden active:border-indigo-300"
            ref={ref}
          />
          {props.type === 'password' && (
            <div
              className="absolute top-1/2 right-3 -translate-y-1/2 transform cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {isPasswordVisible ? <HiOutlineEye /> : <HiOutlineEyeSlash />}
            </div>
          )}
          {icon && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
              {icon}
            </div>
          )}
        </div>
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
