import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import DrugList from '../components/DrugList';
import DrugTracker from '../components/DrugTracker';
import InteractionChecker from '../components/tracking/InteractionChecker';
import ScrollIntoView from '../components/ScrollIntoView';
import { timingProfiles, categoryProfiles } from '../components/DrugTimer/timingProfiles';

const DrugListPage = () => {
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [drugs, setDrugs] = useState([]);

  // Helper function to get total duration in minutes
  const getDrugTiming = (drugName, category) => {
    const profile = timingProfiles[drugName.toLowerCase()] || 
                   categoryProfiles[category] || 
                   timingProfiles.default;
    
    return profile.total();
  };

  useEffect(() => {
    const loadDrugs = () => {
      const savedDrugs = localStorage.getItem('drugs');
      if (savedDrugs) {
        const parsedDrugs = JSON.parse(savedDrugs);
        
        // Update each drug's minTimeBetweenDoses based on timing profile's total duration
        const updatedDrugs = parsedDrugs.map(drug => {
          const totalMinutes = getDrugTiming(drug.name, drug.category);
          
          return {
            ...drug,
            settings: {
              ...drug.settings,
              // Store the total duration in minutes
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

  useEffect(() => {
    if (selectedDrug) {
      const updatedSelectedDrug = drugs.find(drug => drug.id === selectedDrug.id);
      setSelectedDrug(updatedSelectedDrug);
    }
  }, [drugs, selectedDrug]);

  const handleDelete = (id) => {
    const updatedDrugs = drugs.filter(drug => drug.id !== id);
    setDrugs(updatedDrugs);
    localStorage.setItem('drugs', JSON.stringify(updatedDrugs));
    if (selectedDrug?.id === id) {
      setSelectedDrug(null);
    }
  };

  const handleUpdateSettings = (drugId, updatedSettings) => {
    const updatedDrugs = drugs.map(drug => {
      if (drug.id === drugId) {
        // Keep the original minTimeBetweenDoses based on total duration
        const totalMinutes = getDrugTiming(drug.name, drug.category);
        return {
          ...drug,
          settings: {
            ...drug.settings,
            ...updatedSettings,
            minTimeBetweenDoses: totalMinutes / 60
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
  };

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

  // Pass the formatter to DrugList
  const enhancedDrugs = filteredDrugs.map(drug => ({
    ...drug,
    formattedTimeBetweenDoses: formatTimeBetweenDoses(getDrugTiming(drug.name, drug.category))
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Drug List</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Track your substances, monitor doses, and stay safe with timing recommendations.
          Select any drug to view detailed information and record doses.
        </p>
      </div>

      {drugs.length === 0 ? (
        <div className="text-center mb-8">
          <Link
            to="/add"
            className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Drug
          </Link>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {enhancedDrugs.length > 0 ? (
              <DrugList
                drugs={enhancedDrugs}
                onDelete={handleDelete}
                onSelect={setSelectedDrug}
                selectedDrug={selectedDrug}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-6">No drugs found</p>
                <Link
                  to="/add"
                  className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Drug
                </Link>
              </div>
            )}
          </div>

          {selectedDrug && drugs.length > 1 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <InteractionChecker
                currentMedication={selectedDrug}
                allMedications={drugs}
              />
            </div>
          )}
        </div>

        {selectedDrug && (
          <ScrollIntoView
            active={Boolean(selectedDrug)}
            dependency={selectedDrug.id}
          >
            <div className="bg-white rounded-xl shadow-sm">
              <DrugTracker
                drug={selectedDrug}
                onRecordDose={handleRecordDose}
                onUpdateSettings={handleUpdateSettings}
              />
            </div>
          </ScrollIntoView>
        )}
      </div>
    </div>
  );
};

export default DrugListPage;