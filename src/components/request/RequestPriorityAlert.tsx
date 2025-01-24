import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function RequestPriorityAlert() {
  return (
    <div className="bg-red-50 p-4 rounded-lg flex items-start">
      <AlertTriangle className="text-red-500 mr-2 mt-1" size={20} />
      <p className="text-red-700 text-sm">
        Cette demande est marquée comme prioritaire et nécessite une attention immédiate.
      </p>
    </div>
  );
}