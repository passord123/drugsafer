import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AlertProvider } from './contexts/AlertContext/AlertProvider';


// Import pages
import HomePage from './pages/HomePage';
import AddDrugPage from './pages/AddDrugPage';
import DrugListPage from './pages/DrugListPage';
import MedicationStats from './pages/MedicationStats';

// Import components
import ResponsiveNav from './components/ResponsiveNav';


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
      <div className="min-h-screen bg-gray-50 pt-0 lg:pt-16">
      <ResponsiveNav />
          {/* Main Content */}
          <div className="pb-16 lg:pb-0">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/drugs" element={<DrugListPage />} />
              <Route path="/add" element={<AddDrugPage />} />
              <Route path="/stats" element={<MedicationStats />} />
            </Routes>
            </div>
          </div>
      </Router>
    </AlertProvider>
  );
};

export default App;