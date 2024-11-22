// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation  } from 'react-router-dom';
import { AlertProvider } from './contexts/AlertContext/AlertProvider';

// Import pages
import HomePage from './pages/HomePage';
import AddDrugPage from './pages/AddDrugPage';
import DrugListPage from './pages/DrugListPage';
import MedicationStats from './pages/MedicationStats';

// Import components
import MobileOptimizedLayout from './components/layout/MobileOptimizedLayout';

// Import icons
import { AlertTriangle, PlusCircle, List, Home, BarChart } from 'lucide-react';

// NavLink component
const NavLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
        ${isActive
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{children}</span>
    </Link>
  );
};

const App = () => {
  return (
    <AlertProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
                    <AlertTriangle className="h-8 w-8 text-blue-500" />
                    <span className="text-xl font-bold text-gray-900">DrugSafe</span>
                  </Link>
                </div>

                <div className="flex items-center space-x-2">
                  <NavLink to="/" icon={Home}>Home</NavLink>
                  <NavLink to="/drugs" icon={List}>My Drugs</NavLink>
                  <NavLink to="/stats" icon={BarChart}>Stats</NavLink>
                  <NavLink to="/add" icon={PlusCircle}>Add New</NavLink>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="min-h-[calc(100vh-8rem)]">
            <MobileOptimizedLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/drugs" element={<DrugListPage />} />
                <Route path="/add" element={<AddDrugPage />} />
                <Route path="/stats" element={<MedicationStats />} />
              </Routes>
            </MobileOptimizedLayout>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t h-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
              <p className="text-gray-500 text-sm">
                DrugSafe - Safer drug use
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </AlertProvider>
  );
};

export default App;