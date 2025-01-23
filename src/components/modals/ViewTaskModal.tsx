import React from 'react';
import { Clock, User, Flag, Target, Star, Package, MessageSquare, Paperclip, Tag } from 'lucide-react';
import type { Task } from '../../types/task';
import type { Product } from '../../types/product';
import type { TeamMember } from '../../types/team';

interface ViewTaskModalProps {
  task: Task;
  assignees: TeamMember[];
  product: Product | undefined;
  onClose: () => void;
}

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({ task, assignees, product, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                task.status === 'done' ? 'bg-green-100 text-green-800' :
                task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                task.status === 'review' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {task.status}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Détails</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Produit: {product?.name || 'Non assigné'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Début: {task.startDate.toDate().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Échéance: {task.dueDate.toDate().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Heures estimées: {task.estimatedHours || 0}h
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">
                    Points XP: {task.xpReward}
                  </span>
                </div>
              </div>
            </div>

            {/* Assignés */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Assignés</h3>
              <div className="space-y-2">
                {task.assignees.map((assignee) => (
                  <div key={assignee.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <img
                      src={assignee.avatar}
                      alt={assignee.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{assignee.name}</div>
                      <div className="text-xs text-gray-500">{assignee.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progression */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Progression</h3>
              <span className="text-sm font-medium text-gray-900">{task.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  task.progress >= 80 ? 'bg-green-500' :
                  task.progress >= 40 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3 inline-block mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pièces jointes */}
          {task.attachments && task.attachments.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Pièces jointes</h3>
              <div className="space-y-2">
                {task.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{attachment.name}</span>
                    <span className="text-xs text-gray-500">{attachment.type}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Commentaires */}
          {task.comments && task.comments.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Commentaires</h3>
              <div className="space-y-4">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.userAvatar}
                      alt={comment.userName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm">{comment.userName}</span>
                        <span className="text-xs text-gray-500">
                          {comment.timestamp.toDate().toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewTaskModal;