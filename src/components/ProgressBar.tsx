import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  isComplete: boolean;
}

export function ProgressBar({ currentStep, totalSteps, stepTitle, isComplete }: ProgressBarProps) {
  const progress = isComplete ? 100 : (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <span className="text-sm font-medium bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full">
              Step {currentStep} of {totalSteps}
            </span>
          </motion.div>
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold text-gray-900 dark:text-white"
          >
            {stepTitle}
          </motion.span>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-end"
        >
          <span className="text-2xl font-bold blue-text">
            {Math.round(progress)}%
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-300">Complete</span>
        </motion.div>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-blue rounded-full"
          style={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}