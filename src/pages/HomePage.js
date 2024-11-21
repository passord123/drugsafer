// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, List, Clock, Bell, Calendar, BarChart } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
    <div className="mb-4">
      <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center">
        <Icon className="h-6 w-6 text-blue-500" />
      </div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const ActionCard = ({ to, icon: Icon, title, description, color }) => (
  <Link
    to={to}
    className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
  >
    <div className="flex items-center space-x-4">
      <div className={`${color} p-4 rounded-lg`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  </Link>
);

const HomePage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 sm:text-5xl lg:text-6xl">
          Track And Reduce Your Drug Use
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Keep track of your drug consumption, doses, and timing all in one secure place.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <ActionCard
          to="/add"
          icon={PlusCircle}
          title="Add Drug"
          description="Add a new drug to your tracker"
          color="bg-blue-500"
        />
        <ActionCard
          to="/drugs"
          icon={List}
          title="View Your Drugs"
          description="Check your current drugs and history"
          color="bg-green-500"
        />
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          Everything You Need
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={Clock}
            title="Dose Timing"
            description="Track when you take each dose and stay safe with timers and tracking."
          />
          <FeatureCard
            icon={BarChart}
            title="Analytics"
            description="Monitor your drug use and see your recovery progress and sober days with detailed insight."
          />
          <FeatureCard
            icon={List}
            title="History"
            description="Access your complete drug history with detailed logs and reports."
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;