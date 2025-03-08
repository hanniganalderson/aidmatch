import { cn } from '@/lib/utils';

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function GradientText({ children, className, ...props }: GradientTextProps) {
  return (
    <span
      className={cn('bg-gradient-premium bg-clip-text text-transparent', className)}
      {...props}
    >
      {children}
    </span>
  );
}