import React from 'react';
import { Clock } from 'lucide-react';

const ComingSoonBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="font-medium text-gray-900">Module en développement</h3>
          <p className="text-sm text-gray-600">Cette fonctionnalité sera bientôt disponible. Nous travaillons activement pour vous offrir la meilleure expérience possible.</p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonBanner;