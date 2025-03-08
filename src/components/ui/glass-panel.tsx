import { cn } from '@/lib/utils';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassPanel({ children, className, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        'glass-effect rounded-xl p-6 md:p-8',
        'hover:shadow-premium transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}