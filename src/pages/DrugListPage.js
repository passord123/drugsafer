import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import DrugList from '../components/DrugList';
import DrugTracker from '../components/DrugTracker';
import InteractionChecker from '../components/tracking/InteractionChecker';
import ScrollIntoView from '../components/ScrollIntoView';

const DrugListPage = () => {
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [drugs, setDrugs] = useState([]);


  useEffect(() => {
    const loadDrugs = () => {
      const savedDrugs = localStorage.getItem('drugs');
      if (savedDrugs) {
        const parsedDrugs = JSON.parse(savedDrugs);
        console.log('Loaded drugs:', parsedDrugs); // Add this line
        setDrugs(parsedDrugs);
      }
    };

    loadDrugs();
    // Add event listener for storage changes
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
        return {
          ...drug,
          settings: {
            ...drug.settings,
            ...updatedSettings
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
    // Update localStorage
    const updatedDrugs = drugs.map(drug =>
      drug.id === drugId ? updatedDrug : drug
    );
    localStorage.setItem('drugs', JSON.stringify(updatedDrugs));

    // Update state
    setDrugs(updatedDrugs);
    if (selectedDrug?.id === drugId) {
      setSelectedDrug(updatedDrug);
    }
  };
  const calculateDoseStatus = (doseTime, previousDoseTime, minTimeBetweenDoses) => {
    if (!previousDoseTime) return 'normal';
    const doseDate = new Date(doseTime);
    const prevDose = new Date(previousDoseTime);
    const hoursBetween = (doseDate - prevDose) / (1000 * 60 * 60);
    if (hoursBetween < minTimeBetweenDoses / 2) return 'early';
    if (hoursBetween < minTimeBetweenDoses) return 'warning';
    return 'normal';
  };

  const filteredDrugs = drugs.filter(drug =>
    drug.name?.toLowerCase().includes(searchQuery.toLowerCase() || '')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ... other JSX ... */}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {filteredDrugs.length > 0 ? (
              <DrugList
                drugs={filteredDrugs}
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
          <ScrollIntoView active={Boolean(selectedDrug)}>
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