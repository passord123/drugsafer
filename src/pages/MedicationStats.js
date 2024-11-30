import React from 'react';
import { Calendar, Clock, AlertTriangle, Activity, Shield, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Progress = ({ value, warning }) => (
  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
    <div
      className={`h-2.5 rounded-full transition-all duration-300 ${warning ? 'bg-red-500' : 'bg-green-500'
        }`}
      style={{ width: `${value}%` }}
    />
  </div>
);

const StatCard = ({ title, value, subtitle, warning, success }) => {
  return (
    <div className={`p-6 rounded-lg border ${
      warning ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
      success ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
      'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className={`text-3xl font-bold ${
        warning ? 'text-red-600 dark:text-red-400' :
        success ? 'text-green-600 dark:text-green-400' :
        'text-gray-900 dark:text-white'
      }`}>
        {value}
      </p>
      {subtitle && (
        <p className={`text-sm ${
          warning ? 'text-red-600 dark:text-red-400' :
          success ? 'text-green-600 dark:text-green-400' :
          'text-gray-500 dark:text-gray-400'
        }`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

const MedicationStats = () => {
  const medications = JSON.parse(localStorage.getItem('drugs') || '[]');

  const calculateSoberStreak = (doses) => {
    if (!doses?.length) return Infinity; // No doses = continuous sober streak

    const now = new Date();
    const lastDose = new Date(doses[0].timestamp);

    // Calculate days since last dose
    const diffTime = Math.abs(now - lastDose);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const calculateLongestSoberPeriod = (doses) => {
    if (!doses?.length) return Infinity;
    if (doses.length === 1) return calculateSoberStreak(doses);

    let longestStreak = 0;
    const sortedDoses = [...doses].sort((a, b) =>
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    for (let i = 1; i < sortedDoses.length; i++) {
      const currentDose = new Date(sortedDoses[i].timestamp);
      const prevDose = new Date(sortedDoses[i - 1].timestamp);
      const diffTime = Math.abs(currentDose - prevDose);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      longestStreak = Math.max(longestStreak, diffDays);
    }

    // Check current streak
    const currentStreak = calculateSoberStreak(doses);
    return Math.max(longestStreak, currentStreak);
  };

  const calculateStats = () => {
    const stats = medications.reduce((acc, med) => {
      const currentSoberStreak = calculateSoberStreak(med.doses);
      const longestSoberPeriod = calculateLongestSoberPeriod(med.doses);

      // Check doses in last 24 hours
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);
      const recentDoses = med.doses?.filter(dose =>
        new Date(dose.timestamp) > last24Hours
      ).length || 0;

      return {
        medicationCount: acc.medicationCount + 1,
        currentSoberStreak: Math.min(acc.currentSoberStreak, currentSoberStreak),
        longestSoberPeriod: Math.min(acc.longestSoberPeriod, longestSoberPeriod),
        recentDoses: acc.recentDoses + recentDoses,
        medications: [
          ...acc.medications,
          {
            ...med,
            currentSoberStreak,
            recentDoses
          }
        ]
      };
    }, {
      medicationCount: 0,
      currentSoberStreak: Infinity,
      longestSoberPeriod: Infinity,
      recentDoses: 0,
      medications: []
    });

    return {
      ...stats,
      currentSoberStreak: stats.currentSoberStreak === Infinity ? 0 : stats.currentSoberStreak,
      longestSoberPeriod: stats.longestSoberPeriod === Infinity ? 0 : stats.longestSoberPeriod
    };
  };

  const stats = calculateStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Recovery Progress
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track your drug reduction journey
        </p>
      </div>

      {/* Sober Streak */}
      <div className="mb-8 bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-green-500 dark:text-green-400" />
          <h2 className="text-lg font-medium text-green-700 dark:text-green-300">Current Progress</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              {stats.currentSoberStreak} days
            </p>
            <p className="text-green-600 dark:text-green-300">Current sober streak</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              {stats.longestSoberPeriod} days
            </p>
            <p className="text-green-600 dark:text-green-300">Longest period without drugs</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Activity}
          title="Recent Usage"
          value={stats.recentDoses}
          subtitle="Doses in last 24 hours"
          warning={stats.recentDoses > 0}
        />
        <StatCard
          icon={Calendar}
          title="Drugs Tracked"
          value={stats.medicationCount}
          subtitle="Currently monitoring"
        />
        <StatCard
          icon={Shield}
          title="Milestone"
          value={`${stats.longestSoberPeriod} days`}
          subtitle="Longest drug-free period"
          success={stats.longestSoberPeriod > 0}
        />
      </div>

      {/* Individual Medication Stats */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Individual Progress</h2>
        <div className="grid gap-4">
          {stats.medications.map(med => (
            <div
              key={med.id}
              className={`${med.recentDoses > 0
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                } p-6 rounded-lg border shadow-sm`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{med.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {med.currentSoberStreak} days without use
                  </p>
                </div>
                <Link
                  to="/drugs"
                  className="text-blue-500 dark:text-blue-400 text-sm hover:text-blue-600 dark:hover:text-blue-300"
                >
                  View Details
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-2xl font-bold ${med.recentDoses > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                    }`}>
                    {med.recentDoses}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Doses in last 24h</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {med.currentSoberStreak}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sober days</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicationStats;