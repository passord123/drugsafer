import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MobileNav from './MobileNav';

const MobileLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <main className="flex-1 pt-16 pb-16 lg:pt-0 lg:pb-0">
        <div className="pt-16 pb-24 lg:pt-0 lg:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
            {children}
          </div>
        </div>
      </main>

      {/* Desktop Navigation (hidden on mobile) */}
      <nav className="hidden lg:block bg-white shadow-sm sticky top-0 z-50">
        {/* Existing desktop navigation content */}
      </nav>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Footer */}
      <footer className="hidden lg:flex bg-white border-t h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <p className="text-gray-500 text-sm">
            DrugSafe - Safer drug use
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MobileLayout;