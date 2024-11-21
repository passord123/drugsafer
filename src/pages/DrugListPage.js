// src/pages/DrugListPage.js
import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import DrugList from '../components/DrugList';
import DrugTracker from '../components/DrugTracker';

const DrugListPage = () => {
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [drugs, setDrugs] = useState([]);

    // Helper function to calculate dose status
    const calculateStatus = (doseTime, previousDoseTime, minTimeBetweenDoses) => {
        if (!previousDoseTime) return 'normal';

        const doseDate = new Date(doseTime);
        const prevDose = new Date(previousDoseTime);
        const hoursBetween = (doseDate - prevDose) / (1000 * 60 * 60);

        if (hoursBetween < minTimeBetweenDoses / 2) return 'early';
        if (hoursBetween < minTimeBetweenDoses) return 'warning';
        return 'normal';
    };

    // Update drugs from localStorage when component mounts
    useEffect(() => {
        const savedDrugs = localStorage.getItem('drugs');
        if (savedDrugs) {
            setDrugs(JSON.parse(savedDrugs));
        }
    }, []);

    // Update selectedDrug when drugs change
    useEffect(() => {
        if (selectedDrug) {
            const updatedSelectedDrug = drugs.find(drug => drug.id === selectedDrug.id);
            setSelectedDrug(updatedSelectedDrug);
        }
    }, [drugs, selectedDrug]);

    const filteredDrugs = drugs.filter(drug =>
        drug.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = (id) => {
        const updatedDrugs = drugs.filter(drug => drug.id !== id);
        setDrugs(updatedDrugs);
        localStorage.setItem('drugs', JSON.stringify(updatedDrugs));
        if (selectedDrug?.id === id) {
            setSelectedDrug(null);
        }
    };

    const handleRecordDose = (drugId, dose, newSupply) => {
        const updatedDrugs = drugs.map(drug => {
            if (drug.id === drugId) {
                const previousDose = drug.doses?.[0];
                const currentTime = new Date().toISOString();

                const newDose = {
                    timestamp: currentTime,
                    dosage: dose,
                    previousDoseTime: previousDose?.timestamp,
                    status: calculateStatus(
                        currentTime,
                        previousDose?.timestamp,
                        drug.settings?.minTimeBetweenDoses || 4
                    )
                };

                return {
                    ...drug,
                    doses: [newDose, ...(drug.doses || [])],
                    settings: {
                        ...drug.settings,
                        currentSupply: newSupply
                    }
                };
            }
            return drug;
        });

        setDrugs(updatedDrugs);
        localStorage.setItem('drugs', JSON.stringify(updatedDrugs));
    };

    const handleUpdateSettings = (drugId, newSettings) => {
        const updatedDrugs = drugs.map(drug => {
            if (drug.id === drugId) {
                return {
                    ...drug,
                    settings: {
                        ...drug.settings,
                        ...newSettings
                    }
                };
            }
            return drug;
        });

        setDrugs(updatedDrugs);
        localStorage.setItem('drugs', JSON.stringify(updatedDrugs));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">My Medications</h1>
                    <Link
                        to="/add"
                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New
                    </Link>
                </div>

                <div className="max-w-md relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search medications..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
                    {filteredDrugs.length > 0 ? (
                        <DrugList
                            drugs={filteredDrugs}
                            onDelete={handleDelete}
                            onSelect={setSelectedDrug}
                            selectedDrug={selectedDrug}
                        />
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-6">No medications found</p>
                            <Link
                                to="/add"
                                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Your First Medication
                            </Link>
                        </div>
                    )}
                </div>

                {selectedDrug && (
                    <div className="bg-white rounded-xl shadow-sm">
                        <DrugTracker
                            drug={selectedDrug}
                            onRecordDose={handleRecordDose}
                            onUpdateSettings={handleUpdateSettings}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DrugListPage;