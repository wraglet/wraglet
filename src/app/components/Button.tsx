import React, { ButtonHTMLAttributes, Ref, forwardRef } from 'react';

interface ButtonBaseProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = forwardRef(
  ({ ...props }: ButtonBaseProps, ref: Ref<HTMLButtonElement>) => {
    return <button {...props} ref={ref} />;
  }
);

Button.displayName = 'Button';

export default Button;
