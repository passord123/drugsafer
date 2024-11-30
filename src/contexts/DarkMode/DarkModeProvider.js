import React, { createContext, useContext, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

// Create context for dark mode
const DarkModeContext = createContext({
  isDark: false,
  toggleDarkMode: () => {},
});

// Custom hook for accessing dark mode
export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

// Dark mode provider component
export const DarkModeProvider = ({ children }) => {
  // Get system preference and saved preference
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Update class on document root and save preference
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  }, [isDark]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (localStorage.getItem('darkMode') === null) {
        setIsDark(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleDarkMode = () => setIsDark(prev => !prev);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

// Dark mode toggle button component
export const DarkModeToggle = ({ className = '', size = 'default' }) => {
  const { isDark, toggleDarkMode } = useDarkMode();

  const sizes = {
    small: 'p-1.5 text-sm',
    default: 'p-2',
    large: 'p-3 text-lg'
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        rounded-lg transition-colors 
        text-gray-600 dark:text-gray-300 
        hover:bg-gray-100 dark:hover:bg-gray-700/50
        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
        ${sizes[size]}
        ${className}
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

// Color scheme constants
export const darkModeColors = {
  // Background colors
  bg: {
    primary: 'bg-white dark:bg-gray-900',
    secondary: 'bg-gray-50 dark:bg-gray-800',
    tertiary: 'bg-gray-100 dark:bg-gray-700'
  },
  // Text colors
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-300',
    tertiary: 'text-gray-500 dark:text-gray-400'
  },
  // Border colors
  border: {
    primary: 'border-gray-200 dark:border-gray-700',
    secondary: 'border-gray-300 dark:border-gray-600'
  },
  // Status colors
  status: {
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200'
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200'
    }
  },
  // Drug phase colors
  phase: {
    onset: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      progress: 'bg-yellow-500 dark:bg-yellow-600'
    },
    peak: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      progress: 'bg-red-500 dark:bg-red-600'
    },
    offset: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      progress: 'bg-blue-500 dark:bg-blue-600'
    },
    complete: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200',
      progress: 'bg-green-500 dark:bg-green-600'
    }
  }
};

// Reusable dark mode aware components
export const Card = ({ children, className = '', status }) => {
  const statusClasses = status ? darkModeColors.status[status] : null;
  
  return (
    <div className={`
      rounded-lg border transition-colors
      ${statusClasses ? `
        ${statusClasses.bg}
        ${statusClasses.border}
        ${statusClasses.text}
      ` : `
        ${darkModeColors.bg.primary}
        ${darkModeColors.border.primary}
        ${darkModeColors.text.primary}
      `}
      ${className}
    `}>
      {children}
    </div>
  );
};

export const Button = ({ 
  children, 
  variant = 'primary',
  size = 'default',
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300',
    danger: 'bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white'
  };

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`
        rounded-lg transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Export everything
export default {
  DarkModeProvider,
  useDarkMode,
  DarkModeToggle,
  darkModeColors,
  Card,
  Button
};