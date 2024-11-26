import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, Home, List, BarChart, PlusCircle, Menu, X } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

const ResponsiveNav = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <DarkModeToggle />
          </div>
        </div>
      </nav>

      {/* Mobile Header - visible only on mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-40 px-4 transition-colors">
        <div className="h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">DrugSafe</span>
          </Link>
          <div className="flex items-center gap-2">
            <DarkModeToggle variant="minimal" />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-white dark:bg-gray-800 pt-16 transition-colors">
          <nav className="p-4 space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
                  location.pathname === path
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
            <div className="p-4">
              <DarkModeToggle variant="button" className="w-full justify-center" />
            </div>
          </nav>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 z-30 h-16 transition-colors">
        <div className="grid grid-cols-4">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center h-16 gap-1 ${
                location.pathname === path
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default ResponsiveNav;