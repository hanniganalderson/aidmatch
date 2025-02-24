import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  isComplete: boolean;
}

export function ProgressBar({ currentStep, totalSteps, stepTitle, isComplete }: ProgressBarProps) {
  const progress = isComplete ? 100 : ((currentStep - 1) / totalSteps) * 100;

  return (
    <div className="w-full max-w-md mx-auto mb-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <span className="text-sm font-medium bg-primary-500/10 text-primary-500 px-4 py-2 rounded-full">
              Step {currentStep} of {totalSteps}
            </span>
          </motion.div>
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold text-white"
          >
            {stepTitle}
          </motion.span>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-end"
        >
          <span className="text-2xl font-bold premium-text">
            {Math.round(progress)}%
          </span>
          <span className="text-sm text-gray-400">Complete</span>
        </motion.div>
      </div>
      <div className="h-2 bg-surface-50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-premium rounded-full"
          style={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}