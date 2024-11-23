import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, List, BarChart, PlusCircle, AlertTriangle } from 'lucide-react';

const MobileOptimizedLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/drugs', icon: List, label: 'My Drugs' },
    { path: '/stats', icon: BarChart, label: 'Stats' },
    { path: '/add', icon: PlusCircle, label: 'Add' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50">
        <div className="px-4 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-bold text-gray-900">DrugSafe</span>
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-16">
          <nav className="p-4">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 p-4 rounded-lg mb-2 ${
                  location.pathname === path 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content with padding for header and bottom nav */}
      <main className="pt-16 pb-16">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="grid grid-cols-4 h-16">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center space-y-1 ${
                location.pathname === path ? 'text-blue-500' : 'text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MobileOptimizedLayout;