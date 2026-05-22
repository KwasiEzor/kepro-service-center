import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'motion/react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg transition-all duration-300 hover:scale-105 bg-bg-secondary border border-border-primary"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'dark' ? 0 : 180,
          scale: theme === 'dark' ? 1 : 0.8,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-brand-orange-primary" />
        ) : (
          <Moon className="w-5 h-5 text-brand-orange-primary" />
        )}
      </motion.div>
    </motion.button>
  );
};
