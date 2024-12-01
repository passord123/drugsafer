import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, List, BarChart, PlusCircle, AlertTriangle, Moon } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkMode/DarkModeProvider';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { toggleDarkMode } = useDarkMode();

  // Main menu items without dark mode toggle
  const menuItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/drugs', icon: List, label: 'My Drugs' },
    { to: '/stats', icon: BarChart, label: 'Stats' },
    { to: '/add', icon: PlusCircle, label: 'Add New' }
  ];

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-40 px-4 flex items-center justify-between lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-blue-500" />
          <span className="text-base font-semibold text-gray-900 dark:text-white">DrugSafe</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-600 dark:text-gray-300"
          >
            <Moon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-600 dark:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Dropdown Menu - Only main navigation items */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[45] bg-white dark:bg-gray-800 pt-14">
          <nav className="p-4 space-y-1">
            {menuItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg
                  ${location.pathname === to 
                    ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-200'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 z-40 lg:hidden">
        <div className="grid grid-cols-4 h-14">
          {menuItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-0.5
                ${location.pathname === to 
                  ? 'text-blue-500 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default MobileNav;