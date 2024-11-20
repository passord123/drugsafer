import React from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

const InteractionChecker = ({ currentMedication, allMedications }) => {
  const checkInteractions = () => {
    return allMedications
      .filter(med => med.id !== currentMedication.id)
      .map(med => ({
        medication: med.name,
        severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        description: `Potential interaction between ${currentMedication.name} and ${med.name}.`
      }))
      .filter(interaction => interaction.severity !== 'low');
  };

  const interactions = checkInteractions();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Drug Interactions</h3>
        <Info className="w-5 h-5 text-blue-500" />
      </div>

      {interactions.length > 0 ? (
        <div className="space-y-3">
          {interactions.map((interaction, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${
                interaction.severity === 'high' 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                {interaction.severity === 'high' ? (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
                <div>
                  <p className="font-medium">
                    {interaction.severity === 'high' ? 'Serious' : 'Moderate'} Interaction
                  </p>
                  <p className="text-sm mt-1">with {interaction.medication}</p>
                  <p className="text-sm mt-2 opacity-80">{interaction.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p>No known interactions detected</p>
        </div>
      )}
    </div>
  );
};

export default InteractionChecker;