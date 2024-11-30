import React, { useMemo } from 'react';
import { AlertTriangle, Info, AlertCircle, CheckCircle, Shield, 
         ExternalLink, ChevronRight } from 'lucide-react';

const InteractionChecker = ({ currentMedication, allMedications }) => {
  // Map interaction severity to UI elements
  const severityConfig = {
    high: {
      icon: AlertTriangle,
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-500 dark:text-red-400',
      label: 'Dangerous Interaction',
      description: 'High risk - Avoid combining these substances'
    },
    medium: {
      icon: AlertCircle,
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-500 dark:text-yellow-400',
      label: 'Caution Required',
      description: 'Use extreme caution if combining'
    },
    low: {
      icon: Info,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-500 dark:text-blue-400',
      label: 'Minor Interaction',
      description: 'Monitor for adverse effects'
    }
  };

  // Check interactions between drugs
  const interactions = useMemo(() => {
    return allMedications
      .filter(med => med.id !== currentMedication.id)
      .map(med => {
        // Here you would implement actual drug interaction logic
        // This is a simplified example
        let severity;
        if (currentMedication.category === 'Benzodiazepiner' && 
            (med.category === 'Opioider' || med.category === 'Benzodiazepiner')) {
          severity = 'high';
        } else if (currentMedication.category === 'Sentralstimulerende' && 
                  med.category === 'Sentralstimulerende') {
          severity = 'medium';
        } else {
          severity = 'low';
        }

        return {
          medication: med,
          severity,
          description: getInteractionDescription(currentMedication, med, severity)
        };
      })
      .filter(interaction => interaction.severity !== 'none')
      .sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
  }, [currentMedication, allMedications]);

  // Get detailed interaction description
  function getInteractionDescription(drug1, drug2, severity) {
    if (severity === 'high') {
      return `Combining ${drug1.name} with ${drug2.name} significantly increases risk of respiratory depression and overdose. This combination should be avoided.`;
    } else if (severity === 'medium') {
      return `Use of ${drug1.name} with ${drug2.name} may increase risk of adverse effects. Close monitoring required.`;
    }
    return `Minor interaction possible between ${drug1.name} and ${drug2.name}. Monitor for changes in effect.`;
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-500 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Drug Interactions
          </h2>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Checking {allMedications.length - 1} substances
        </span>
      </div>

      {interactions.length > 0 ? (
        <div className="space-y-4">
          {/* High Risk Warning */}
          {interactions.some(i => i.severity === 'high') && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 
                         border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-200">
                    Dangerous Combinations Detected
                  </h3>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                    Some of your substances have potentially dangerous interactions. 
                    Review the details below carefully.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Interaction List */}
          <div className="space-y-3">
            {interactions.map((interaction, index) => {
              const config = severityConfig[interaction.severity];
              const Icon = config.icon;

              return (
                <div
                  key={interaction.medication.id}
                  className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${config.text}`}>
                          {config.label}
                        </h3>
                        <span className={`text-sm ${config.text} opacity-75`}>
                          with {interaction.medication.name}
                        </span>
                      </div>
                      <p className={`mt-1 text-sm ${config.text} opacity-90`}>
                        {interaction.description}
                      </p>

                      {/* Category and Dosage Info */}
                      <div className="mt-3 flex flex-wrap gap-3">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                    ${config.bg} ${config.text}`}>
                          {interaction.medication.category}
                        </div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                    ${config.bg} ${config.text}`}>
                          {interaction.medication.dosage} {interaction.medication.dosageUnit}
                        </div>
                      </div>

                      {/* Additional Safety Info */}
                      {interaction.severity === 'high' && (
                        <div className="mt-3 flex items-start gap-2">
                          <Shield className={`w-4 h-4 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                          <p className={`text-sm ${config.text}`}>
                            This combination significantly increases risk. Consider alternatives.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center p-8">
          <CheckCircle className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Interactions Detected
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            No known interactions found between your current substances. 
            Always monitor for unexpected effects.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg 
                   bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>This interaction checker provides general guidance only. 
               Actual risks may vary based on individual factors.</p>
            <p className="mt-2">Always consult healthcare professionals and 
               verify information from multiple sources.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractionChecker;