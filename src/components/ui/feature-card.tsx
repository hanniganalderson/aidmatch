import { cn } from '@/lib/utils';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description, className, ...props }: FeatureCardProps) {
  return (
    <div
      className={cn(
        'group bg-surface-100/50 backdrop-blur-sm rounded-xl p-8',
        'border-2 border-surface-50 hover:border-primary-500/50',
        'transition-all duration-200 hover:shadow-premium-hover',
        className
      )}
      {...props}
    >
      <div className="bg-surface-50 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-primary-500/10 transition-colors duration-200">
        <Icon className="w-8 h-8 text-primary-500" />
      </div>
      <h3 className="text-xl font-bold mb-4 group-hover:text-primary-500 transition-colors duration-200">
        {title}
      </h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}