import React, { useState } from 'react';
import { Calendar, Target, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Goal } from '../types';

interface GoalsPlannerProps {
  goals: Goal[];
  onGoalUpdate: (goal: Goal) => void;
}

const GoalsPlanner: React.FC<GoalsPlannerProps> = ({ goals, onGoalUpdate }) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble des objectifs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Objectifs en cours</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {goals.filter(g => g.status === 'in-progress').length}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Sur {goals.length} objectifs totaux
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold">Objectifs complétés</h3>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {goals.filter(g => g.status === 'completed').length}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Ce trimestre
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold">Objectifs à risque</h3>
          </div>
          <div className="text-3xl font-bold text-yellow-600">
            {goals.filter(g => g.progress < 50 && g.status === 'in-progress').length}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Nécessitent attention
          </p>
        </div>
      </div>

      {/* Timeline des objectifs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-6">Timeline des Objectifs</h3>
        <div className="space-y-6">
          {goals.map((goal) => (
            <div 
              key={goal.id}
              className="relative cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors"
              onClick={() => setSelectedGoal(goal)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-32 text-sm text-gray-600">
                  {new Date(goal.startDate).toLocaleDateString()}
                </div>
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  goal.status === 'completed' ? 'bg-green-500' :
                  goal.status === 'in-progress' ? 'bg-blue-500' :
                  'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{goal.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                      goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {goal.priority}
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progression</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(goal.progress)}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {goal.assignedTo.map((member, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                          title={member}
                        >
                          <span className="text-xs font-medium">
                            {member.charAt(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      <Calendar className="w-4 h-4 inline-block mr-1" />
                      Échéance: {new Date(goal.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoalsPlanner;