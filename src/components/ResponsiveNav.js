import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, Home, List, BarChart, PlusCircle, Menu, X } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/drugs', icon: List, label: 'My Drugs' },
  { path: '/stats', icon: BarChart, label: 'Stats' },
  { path: '/add', icon: PlusCircle, label: 'Add New' }
];

const ResponsiveNav = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavLink = ({ to, icon: Icon, children, onClick }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-2 p-2 rounded-lg transition-colors
          ${isActive 
            ? 'bg-blue-50 text-blue-600' 
            : 'text-gray-600 hover:bg-gray-50'
          }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{children}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Top Header - Always visible on mobile and desktop */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-bold">DrugSafe</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-4">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink key={path} to={path} icon={Icon}>{label}</NavLink>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 lg:hidden hover:bg-gray-100 rounded-lg"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white pt-16">
          <nav className="p-4 space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink 
                key={path} 
                to={path} 
                icon={Icon}
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-30">
        <div className="grid grid-cols-4 h-16">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center gap-1
                ${location.pathname === path ? 'text-blue-500' : 'text-gray-600'}`}
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