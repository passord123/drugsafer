import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Clock, Pill, Timer, AlertTriangle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import DrugList from '../components/DrugList';
import DrugTracker from '../components/DrugTracker';
import InteractionChecker from '../components/tracking/InteractionChecker';
import ScrollIntoView from '../components/ScrollIntoView';
import { timingProfiles, categoryProfiles } from '../components/DrugTimer/timingProfiles';
import { useAlerts } from '../contexts/AlertContext';

const DrugListPage = () => {
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [drugs, setDrugs] = useState([]);
  const { addAlert } = useAlerts();

  // Helper function to get total duration in minutes
  const getDrugTiming = (drugName, category) => {
    const profile = timingProfiles[drugName.toLowerCase()] || 
                   categoryProfiles[category] || 
                   timingProfiles.default;
    
    return profile.total();
  };

  // Load drugs from localStorage
  useEffect(() => {
    const loadDrugs = () => {
      const savedDrugs = localStorage.getItem('drugs');
      if (savedDrugs) {
        const parsedDrugs = JSON.parse(savedDrugs);
        
        // Update each drug's minTimeBetweenDoses based on timing profile
        const updatedDrugs = parsedDrugs.map(drug => {
          const totalMinutes = getDrugTiming(drug.name, drug.category);
          
          return {
            ...drug,
            settings: {
              ...drug.settings,
              minTimeBetweenDoses: totalMinutes / 60
            }
          };
        });

        setDrugs(updatedDrugs);
        localStorage.setItem('drugs', JSON.stringify(updatedDrugs));
      }
    };

    loadDrugs();
    window.addEventListener('storage', loadDrugs);
    return () => window.removeEventListener('storage', loadDrugs);
  }, []);

  // Update selected drug when drugs change
  useEffect(() => {
    if (selectedDrug) {
      const updatedSelectedDrug = drugs.find(drug => drug.id === selectedDrug.id);
      setSelectedDrug(updatedSelectedDrug);
    }
  }, [drugs, selectedDrug]);

  // Handle drug deletion
  const handleDelete = (id) => {
    const drugToDelete = drugs.find(drug => drug.id === id);
    const updatedDrugs = drugs.filter(drug => drug.id !== id);
    setDrugs(updatedDrugs);
    localStorage.setItem('drugs', JSON.stringify(updatedDrugs));
    if (selectedDrug?.id === id) {
      setSelectedDrug(null);
    }
    addAlert(`${drugToDelete.name} has been removed`, 'success');
  };

  // Handle settings updates
  const handleUpdateSettings = (drugId, updatedSettings) => {
    const updatedDrugs = drugs.map(drug => {
      if (drug.id === drugId) {
        const totalMinutes = getDrugTiming(drug.name, drug.category);
        return {
          ...drug,
          settings: {
            ...drug.settings,
            ...updatedSettings,
            minTimeBetweenDoses: updatedSettings.useRecommendedTiming 
              ? totalMinutes / 60 
              : updatedSettings.minTimeBetweenDoses
          }
        };
      }
      return drug;
    });

    localStorage.setItem('drugs', JSON.stringify(updatedDrugs));
    setDrugs(updatedDrugs);

    if (selectedDrug?.id === drugId) {
      const updatedDrug = updatedDrugs.find(d => d.id === drugId);
      setSelectedDrug(updatedDrug);
    }
    addAlert('Settings updated successfully', 'success');
  };

  // Handle dose recording
  const handleRecordDose = (drugId, updatedDrug) => {
    const updatedDrugs = drugs.map(drug =>
      drug.id === drugId ? updatedDrug : drug
    );
    localStorage.setItem('drugs', JSON.stringify(updatedDrugs));
    setDrugs(updatedDrugs);
    if (selectedDrug?.id === drugId) {
      setSelectedDrug(updatedDrug);
    }
  };

  // Filter drugs based on search
  const filteredDrugs = drugs.filter(drug =>
    drug.name?.toLowerCase().includes(searchQuery.toLowerCase() || '')
  );

  // Format time between doses for display
  const formatTimeBetweenDoses = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    
    if (hours === 0) {
      return `${remainingMinutes}m`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  // Enhance drugs with formatted time
  const enhancedDrugs = filteredDrugs.map(drug => ({
    ...drug,
    formattedTimeBetweenDoses: formatTimeBetweenDoses(getDrugTiming(drug.name, drug.category))
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Drug List</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Track your substances, monitor doses, and stay safe with timing recommendations.
          Select any drug to view detailed information and record doses.
        </p>
      </div>
  
      {drugs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Link
            to="/add"
            className="inline-flex items-center px-8 py-4 bg-blue-500 dark:bg-blue-600 text-white 
                     rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors text-lg"
          >
            <Plus className="w-6 h-6 mr-2" />
            Add Your First Drug
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <DrugList
                drugs={enhancedDrugs}
                onDelete={handleDelete}
                onSelect={setSelectedDrug}
                selectedDrug={selectedDrug}
              />
            </div>

            {/* Interaction Checker */}
            {selectedDrug && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <InteractionChecker
                  currentMedication={selectedDrug}
                  allMedications={drugs}
                />
              </div>
            )}
          </div>
  
          {/* Drug Tracker */}
          {selectedDrug && (
            <ScrollIntoView
              active={Boolean(selectedDrug)}
              dependency={selectedDrug.id}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <DrugTracker
                  drug={selectedDrug}
                  onRecordDose={handleRecordDose}
                  onUpdateSettings={handleUpdateSettings}
                />
              </div>
            </ScrollIntoView>
          )}
        </div>
      )}

      {/* Quick Add Button - Fixed on mobile */}
      <div className="lg:hidden fixed right-4 bottom-20 z-20">
        <Link
          to="/add"
          className="flex items-center justify-center w-14 h-14 bg-blue-500 dark:bg-blue-600 
                   text-white rounded-full shadow-lg hover:bg-blue-600 dark:hover:bg-blue-700 
                   transition-colors"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
};

export default DrugListPage;