import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { Task } from '../types';

interface ProjectTimelineProps {
  tasks: Task[];
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ tasks }) => {
  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const getTaskDuration = (task: Task) => {
    const start = new Date(task.startDate);
    const end = new Date(task.dueDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'done': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'review': return 'bg-purple-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Timeline</h3>
      <div className="space-y-6">
        {sortedTasks.map((task) => (
          <div key={task.id} className="relative">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-32 text-sm text-gray-600">
                {new Date(task.startDate).toLocaleDateString()}
              </div>
              <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(task.status)}`} />
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                        alt={task.assignee}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-gray-600">{task.assignee}</span>
                    </div>
                    <span className="text-gray-500">
                      Duration: {getTaskDuration(task)} days
                    </span>
                  </div>
                  {task.dependencies && task.dependencies.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ChevronRight className="w-4 h-4" />
                        <span>Depends on: {task.dependencies.join(', ')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTimeline;