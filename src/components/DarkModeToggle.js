import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkMode/DarkModeProvider';

const DarkModeToggle = ({ className = '', variant = 'default' }) => {
  const { isDark, toggleDarkMode } = useDarkMode();

  const variants = {
    default: `p-2 rounded-lg transition-colors 
              dark:text-gray-300 text-gray-600 
              hover:bg-gray-100 dark:hover:bg-gray-800
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`,
    minimal: `p-1 rounded transition-colors 
             dark:text-gray-300 text-gray-600 
             hover:bg-gray-100 dark:hover:bg-gray-800
             focus:outline-none`,
    pill: `px-3 py-2 rounded-full transition-colors
           bg-gray-100 dark:bg-gray-800
           text-gray-600 dark:text-gray-300
           hover:bg-gray-200 dark:hover:bg-gray-700
           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
           flex items-center gap-2`
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`${variants[variant]} ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {variant === 'minimal' ? (
        isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
      ) : (
        <>
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {isDark ? 'Light' : 'Dark'}
          </span>
        </>
      )}
    </button>
  );
};

export default DarkModeToggle;