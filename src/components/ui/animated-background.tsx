import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AnimatedBackground({ children, className, ...props }: AnimatedBackgroundProps) {
  return (
    <div className={cn('relative overflow-hidden', className)} {...props}>
      <div className="absolute inset-0">
        <div className="absolute -top-[30rem] -left-[30rem] w-[60rem] h-[60rem] rounded-full bg-primary-500/20 opacity-20 blur-[128px]" />
        <div className="absolute -bottom-[30rem] -right-[30rem] w-[60rem] h-[60rem] rounded-full bg-primary-600/20 opacity-20 blur-[128px]" />
      </div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
      {children}
    </div>
  );
}