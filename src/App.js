import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AlertProvider } from './contexts/AlertContext/AlertProvider';
import { Moon, Sun, AlertCircleIcon } from 'lucide-react';
import { DarkModeProvider, useDarkMode } from './contexts/DarkMode/DarkModeProvider';

// Import pages
import HomePage from './pages/HomePage';
import AddDrugPage from './pages/AddDrugPage';
import DrugListPage from './pages/DrugListPage';
import MedicationStats from './pages/MedicationStats';

// Import components
import ResponsiveNav from './components/ResponsiveNav';

// Dark Mode Toggle Button Component
const DarkModeToggle = () => {
  const { isDark, toggleDarkMode } = useDarkMode();
  
  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg transition-colors dark:text-gray-300 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle dark mode"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

// Main App Layout Component
const AppLayout = ({ children }) => {
  const { isDark } = useDarkMode();

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors ${isDark ? 'dark' : ''}`}>
      <ResponsiveNav DarkModeToggle={DarkModeToggle} />
      
      {/* Main Content Area with responsive padding */}
      <main className="flex-1 w-full pt-16 pb-16 lg:pt-24 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer - hidden on mobile, always at bottom on desktop */}
      <footer className="hidden lg:block bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            DrugSafe - For harm reduction
          </p>
          <div className="flex items-center gap-4">
            <AlertCircleIcon />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use at your own risk
            </p>
          </div>
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
    <DarkModeProvider>
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
    </DarkModeProvider>
  );
};

export default App;