import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, Trophy, Star } from 'lucide-react';
import type { TeamMember } from '../../types/team';

interface ViewMemberModalProps {
  member: TeamMember;
  onClose: () => void;
}

const ViewMemberModal: React.FC<ViewMemberModalProps> = ({ member, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Détails du membre</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-6 mb-6">
            <img
              src={member.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'}
              alt={member.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
              <p className="text-gray-600">{member.role}</p>
              <div className="flex items-center gap-2 mt-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-700">Niveau {member.level}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-700">{member.points} points</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium">{member.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Date d'ajout</div>
                <div className="font-medium">
                  {member.createdAt.toDate().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Compétences</h4>
            <div className="flex flex-wrap gap-2">
              {member.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Badges</h4>
            <div className="flex flex-wrap gap-4">
              {member.badges.map((badge, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMemberModal;