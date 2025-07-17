import { ButtonHTMLAttributes, forwardRef, Ref } from 'react'

interface ButtonBaseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

const Button = forwardRef(
  (
    { className = '', disabled, ...props }: ButtonBaseProps,
    ref: Ref<HTMLButtonElement>
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`transition-all duration-150 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:grayscale ${className}`}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export default Button
