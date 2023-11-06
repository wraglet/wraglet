import React, {
  forwardRef,
  ForwardedRef,
  InputHTMLAttributes,
  ReactNode,
  useState
} from 'react';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  type?: string;
}

const Input = forwardRef(
  (
    { label, icon, type = 'text', ...props }: InputProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
      setIsPasswordVisible((prev) => !prev);
    };

    return (
      <div className={`flex flex-col w-full`}>
        {label && (
          <label className='mb-0.5 pl-1 text-sm text-slate-600'>{label}</label>
        )}
        <div className='relative flex items-center'>
          <input
            {...props}
            type={type === 'password' && isPasswordVisible ? 'text' : type}
            className='hover:border-slate-300 focus:border-indigo-300 h-8 w-full border border-solid border-slate-200 rounded py-1.5 px-4 text-xs pr-10 active:border-indigo-300 focus:outline-none'
            ref={ref}
          />
          {type === 'password' && (
            <div
              className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer'
              onClick={togglePasswordVisibility}
            >
              {isPasswordVisible ? <HiOutlineEye /> : <HiOutlineEyeSlash />}
            </div>
          )}
          {icon && (
            <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
