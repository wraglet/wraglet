import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:grayscale',
  {
    variants: {
      variant: {
        unstyled: '',
        default:
          'bg-gradient-to-r from-[#42BBFF] to-[#0EA5E9] text-white shadow-md hover:from-[#0EA5E9] hover:to-[#42BBFF] focus-visible:ring-[#0EA5E9]',
        destructive:
          'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:from-red-600 hover:to-red-700 focus-visible:ring-red-500',
        outline:
          'border border-[#0EA5E9] bg-white text-[#0EA5E9] hover:bg-[#eaf6fd] focus-visible:ring-[#0EA5E9]',
        secondary:
          'bg-sky-100 text-sky-700 hover:bg-sky-200 focus-visible:ring-sky-400',
        ghost: 'text-gray-700 hover:bg-slate-100 focus-visible:ring-slate-300',
        link: 'text-[#0EA5E9] underline-offset-4 hover:underline focus-visible:ring-[#0EA5E9]'
      },
      size: {
        unstyled: '',
        default: 'h-10 rounded-xl px-4 py-2 text-sm',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-xl px-6 text-base',
        icon: 'h-9 w-9 rounded-full'
      }
    },
    defaultVariants: {
      variant: 'unstyled',
      size: 'unstyled'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef(
  (
    {
      className,
      disabled,
      variant,
      size,
      asChild = false,
      ...props
    }: ButtonProps,
    ref: React.Ref<HTMLButtonElement>
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        disabled={disabled}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { buttonVariants }
export default Button
