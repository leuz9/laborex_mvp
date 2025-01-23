import React from 'react';
import { Calendar, Clock, Users, BarChart2, MessageSquare, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { Project } from '../types';

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const projectMetrics = {
    tasksCompleted: 12,
    tasksInProgress: 5,
    tasksBlocked: 2,
    teamVelocity: 85,
    upcomingDeadlines: 3,
    recentComments: 8
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
              <p className="text-gray-600 mt-2">{project.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              project.status === 'completed' ? 'bg-green-100 text-green-800' :
              project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium">{new Date(project.startDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-medium">{new Date(project.endDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Team Size</p>
                <p className="font-medium">{project.teamMembers.length} members</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="font-medium">{project.progress}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Task Status</h3>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="font-medium text-green-600">{projectMetrics.tasksCompleted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="font-medium text-blue-600">{projectMetrics.tasksInProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Blocked</span>
                <span className="font-medium text-red-600">{projectMetrics.tasksBlocked}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Team Velocity</h3>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {projectMetrics.teamVelocity}%
            </div>
            <p className="text-sm text-gray-600">
              Sprint completion rate
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Upcoming Deadlines</h3>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {projectMetrics.upcomingDeadlines}
            </div>
            <p className="text-sm text-gray-600">
              Tasks due this week
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { user: 'Sarah Johnson', action: 'updated the project status', time: '2 hours ago' },
            { user: 'Michael Chen', action: 'completed a task', time: '4 hours ago' },
            { user: 'Emma Wilson', action: 'added new design files', time: '1 day ago' },
            { user: 'Sarah Johnson', action: 'commented on Homepage Redesign', time: '1 day ago' },
            { user: 'Michael Chen', action: 'started working on Mobile Responsiveness', time: '2 days ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm">
                  <span className="font-medium text-gray-900">{activity.user}</span>
                  {' '}{activity.action}
                </p>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;