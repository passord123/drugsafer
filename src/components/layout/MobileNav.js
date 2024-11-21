import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, List, BarChart, PlusCircle, AlertTriangle } from 'lucide-react';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/drugs', icon: List, label: 'My Drugs' },
    { to: '/stats', icon: BarChart, label: 'Stats' },
    { to: '/add', icon: PlusCircle, label: 'Add New' }
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 px-4 flex items-center justify-between lg:hidden">
        <Link to="/" className="flex items-center space-x-2">
          <AlertTriangle className="h-6 w-6 text-blue-500" />
          <span className="text-lg font-bold text-gray-900">DrugSafe</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 lg:hidden">
        <div className="grid grid-cols-4 h-16">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center space-y-1 
                ${location.pathname === to ? 'text-blue-500' : 'text-gray-600'}
                active:bg-gray-100`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
      </div>


      {/* Mobile Menu Overlay */}
      {isOpen && (
      <div className="fixed inset-0 z-[55] bg-white pt-16">
          <div className="p-4 space-y-4">
            {links.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-4 px-4 py-3 rounded-lg
                  ${location.pathname === to 
                    ? 'bg-blue-50 text-blue-500' 
                    : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Icon className="w-6 h-6" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;