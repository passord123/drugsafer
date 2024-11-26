import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, Home, List, BarChart, PlusCircle, Menu, X } from 'lucide-react';

const ResponsiveNav = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/drugs', icon: List, label: 'My Drugs' },
    { path: '/stats', icon: BarChart, label: 'Stats' },
    { path: '/add', icon: PlusCircle, label: 'Add New' }
  ];

  const NavLink = ({ to, icon: Icon, children, onClick, className }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`${className} ${
          isActive 
            ? 'text-blue-500' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {Icon && <Icon className="w-5 h-5" />}
        <span className={`font-medium ${className?.includes('flex-col') ? 'text-xs' : ''}`}>
          {children}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Navigation - hidden on mobile */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 h-16 bg-white border-b z-40">
        <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-bold">DrugSafe</span>
          </Link>
          <div className="flex gap-6">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink 
                key={path} 
                to={path} 
                icon={Icon}
                className="flex items-center gap-2 py-2"
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Header - visible only on mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 px-4">
        <div className="h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-bold">DrugSafe</span>
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-white pt-16">
          <nav className="p-4 space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink 
                key={path} 
                to={path} 
                icon={Icon}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50"
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Mobile Bottom Navigation - visible only on mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-30 h-16">
        <div className="grid grid-cols-4">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              icon={Icon}
              className="flex flex-col items-center justify-center h-16 gap-1"
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile bottom spacing to prevent content from being hidden */}
      <div className="lg:hidden h-16" />
    </>
  );
};

export default ResponsiveNav;