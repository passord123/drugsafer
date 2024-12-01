import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, List, BarChart, PlusCircle, AlertTriangle, Moon } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkMode/DarkModeProvider';

const ResponsiveNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { toggleDarkMode } = useDarkMode();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/drugs', icon: List, label: 'My Drugs' },
    { path: '/stats', icon: BarChart, label: 'Stats' },
    { path: '/add', icon: PlusCircle, label: 'Add New' }
  ];

  return (
    <>
      {/* Desktop Navigation - hidden on mobile */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">DrugSafe</span>
          </Link>
          <div className="flex items-center gap-6">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
                  location.pathname === path
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg transition-colors dark:text-gray-300 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Moon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-40 px-4 flex items-center justify-between">
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
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[45] bg-white dark:bg-gray-800 pt-14">
          <nav className="p-4 space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                  location.pathname === path
                    ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 z-30 h-16">
        <div className="grid grid-cols-4 h-full">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center gap-1 ${
                location.pathname === path
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default ResponsiveNav;