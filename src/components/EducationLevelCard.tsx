// React is used implicitly for JSX
import { motion } from 'framer-motion';
import { School, GraduationCap, BookOpen, Microscope } from 'lucide-react';

interface EducationLevelCardProps {
  level: string;
  selected: boolean;
  onClick: () => void;
}

export const EducationLevelCard = ({ level, selected, onClick }: EducationLevelCardProps) => {
  const getIcon = () => {
    switch (level) {
      case 'High School Senior':
        return <School className="w-6 h-6" />;
      case 'College Freshman':
      case 'College Sophomore':
      case 'College Junior':
      case 'College Senior':
        return <GraduationCap className="w-6 h-6" />;
      case 'Masters Student':
        return <BookOpen className="w-6 h-6" />;
      case 'PhD Student':
        return <Microscope className="w-6 h-6" />;
      default:
        return <GraduationCap className="w-6 h-6" />;
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full p-4 rounded-lg border transition-all duration-200 ${
        selected
          ? 'bg-blue-600/20 border-blue-600 text-gray-900 dark:text-white'
          : 'bg-white dark:bg-[#222222] border-gray-200 dark:border-[#333333] text-gray-700 dark:text-[#888888] hover:bg-gray-50 dark:hover:bg-[#2A2A2A]'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={selected ? 'text-blue-600' : 'text-gray-500 dark:text-[#666666]'}>
          {getIcon()}
        </div>
        <span className="text-left">{level}</span>
      </div>
    </motion.button>
  );
};