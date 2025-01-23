import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{task.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            </div>
            <div className="flex items-center gap-3">
              {getPriorityIcon(task.priority)}
              <span className={`px-2 py-1 rounded-full text-xs ${
                task.status === 'done' ? 'bg-green-100 text-green-800' :
                task.status === 'review' ? 'bg-purple-100 text-purple-800' :
                task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {task.status}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
            <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
            <div className="flex items-center gap-2">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                alt={task.assignee}
                className="w-6 h-6 rounded-full"
              />
              <span>{task.assignee}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;