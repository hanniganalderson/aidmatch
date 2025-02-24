import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border bg-surface-100 px-4 py-2 text-sm text-white placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
          'hover:border-surface-50/80',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200',
          error ? 'border-red-500 focus:ring-red-500/50' : 'border-surface-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };