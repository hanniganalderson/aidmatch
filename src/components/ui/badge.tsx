import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40',
        secondary:
          'border-transparent bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700',
        success:
          'border-transparent bg-success-50 text-success-600 dark:bg-success-900/30 dark:text-success-400 hover:bg-success-100 dark:hover:bg-success-900/40',
        warning:
          'border-transparent bg-warning-50 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400 hover:bg-warning-100 dark:hover:bg-warning-900/40',
        error:
          'border-transparent bg-error-50 text-error-600 dark:bg-error-900/30 dark:text-error-400 hover:bg-error-100 dark:hover:bg-error-900/40',
        outline: 'border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };