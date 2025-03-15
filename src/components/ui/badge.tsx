import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300",
        secondary: "bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-300",
        accent: "bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300",
        destructive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        outline: "border border-primary-200 text-primary-700 dark:border-primary-800 dark:text-primary-300",
        success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}