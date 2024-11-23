import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AlertProvider } from './contexts/AlertContext/AlertProvider';

// Import pages
import HomePage from './pages/HomePage';
import AddDrugPage from './pages/AddDrugPage';
import DrugListPage from './pages/DrugListPage';
import MedicationStats from './pages/MedicationStats';

// Import components
import ResponsiveNav from './components/ResponsiveNav';

// Main App Layout Component
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ResponsiveNav />
      
      {/* Main Content Area with responsive padding */}
      <main className="flex-1 w-full pt-16 pb-16 lg:pt-24 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer - hidden on mobile, always at bottom on desktop */}
      <footer className="hidden lg:block bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            DrugSafe - For harm reduction
          </p>
          <p className="text-sm text-gray-500">
            Use at your own risk
          </p>
        </div>
      </footer>

      {/* Spacer for mobile bottom navigation */}
      <div className="h-16 lg:hidden" />
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <AlertProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/drugs" element={<DrugListPage />} />
            <Route path="/add" element={<AddDrugPage />} />
            <Route path="/stats" element={<MedicationStats />} />
          </Routes>
        </AppLayout>
      </Router>
    </AlertProvider>
  );
};

export default App;