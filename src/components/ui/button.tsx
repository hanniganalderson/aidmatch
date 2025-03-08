import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-premium-hover focus:ring-primary-500/50',
        secondary: 'bg-surface-50 text-white hover:bg-surface-100 hover:shadow-premium focus:ring-surface-50/50',
        outline: 'border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-surface-dark-50/10 hover:border-primary-500/30 focus:ring-primary-500/30',
        ghost: 'hover:bg-gray-100 dark:hover:bg-surface-dark-50/10 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400',
        link: 'text-primary-500 hover:underline underline-offset-4',
        gradient: 'bg-gradient-green text-white hover:opacity-90 shadow-md hover:shadow-premium-hover'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 py-1 text-xs',
        lg: 'h-12 px-8 py-3 text-base',
        xl: 'h-14 px-10 py-4 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  // Add Framer Motion props that we're using
  whileHover?: any;
  whileTap?: any;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    children, 
    isLoading = false, 
    icon, 
    iconPosition = 'left',
    disabled,
    ...props 
  }, ref) => {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          buttonVariants({ variant, size, className }),
          isLoading && 'opacity-70 cursor-not-allowed'
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props as any}
      >
        {isLoading && (
          <span className="mr-2">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        )}
        
        {!isLoading && icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        
        {children}
        
        {!isLoading && icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };