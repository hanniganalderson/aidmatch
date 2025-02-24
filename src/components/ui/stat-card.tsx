import { cn } from '@/lib/utils';
import { GradientText } from './gradient-text';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  label: string;
}

export function StatCard({ value, label, className, ...props }: StatCardProps) {
  return (
    <div
      className={cn(
        'text-center p-6 bg-surface-100/50 backdrop-blur-sm rounded-xl',
        'border border-surface-50 hover:border-primary-500/20',
        'transition-all duration-200 hover:shadow-premium',
        className
      )}
      {...props}
    >
      <GradientText className="text-4xl font-bold mb-2">{value}</GradientText>
      <p className="text-gray-400">{label}</p>
    </div>
  );
}