import React from 'react';
import { BarChart2, TrendingUp, Users, Award, Target, Brain } from 'lucide-react';
import type { TeamMember, Performance } from '../types';

interface PerformanceReportProps {
  member: TeamMember;
}

const PerformanceReport: React.FC<PerformanceReportProps> = ({ member }) => {
  const mockPerformance: Performance = {
    metrics: {
      productivity: 87,
      quality: 92,
      collaboration: 95,
      innovation: 88
    },
    trends: {
      weekly: 5,
      monthly: 12,
      quarterly: 8
    },
    objectives: {
      completed: 8,
      total: 10
    }
  };

  const performance = member.performance || mockPerformance;

  return (
    <div className="space-y-6">
      {/* En-tête du Rapport */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={member.avatar}
            alt={member.name}
            className="w-16 h-16 rounded-full border-2 border-white"
          />
          <div>
            <h2 className="text-2xl font-bold">{member.name}</h2>
            <p className="text-blue-100">{member.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5" />
              <span>Niveau</span>
            </div>
            <div className="text-2xl font-bold">{member.level}</div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5" />
              <span>Points</span>
            </div>
            <div className="text-2xl font-bold">{member.points}</div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5" />
              <span>Badges</span>
            </div>
            <div className="text-2xl font-bold">{member.badges?.length}</div>
          </div>
        </div>
      </div>

      {/* Métriques de Performance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Métriques de Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(performance.metrics).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {key}
                </span>
                <span className="text-sm font-medium">{value}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-2 rounded-full ${
                    key === 'productivity' ? 'bg-green-500' :
                    key === 'quality' ? 'bg-blue-500' :
                    key === 'collaboration' ? 'bg-purple-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tendances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Tendances de Croissance
          </h3>
          <div className="space-y-4">
            {Object.entries(performance.trends).map(([period, value]) => (
              <div key={period} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{period}</span>
                <span className={`text-sm font-medium ${
                  value > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {value > 0 ? '+' : ''}{value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Objectifs
          </h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {performance.objectives.completed}/{performance.objectives.total}
              </div>
              <p className="text-sm text-gray-600 mt-2">Objectifs Complétés</p>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-600 rounded-full"
                style={{
                  width: `${(performance.objectives.completed / performance.objectives.total) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Badges et Récompenses */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Badges et Récompenses</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {member.badges?.map((badge, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;