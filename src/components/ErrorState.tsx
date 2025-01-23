import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
      <AlertTriangle className="w-12 h-12 text-red-600" />
      <h3 className="mt-4 text-lg font-semibold text-red-900">Une erreur est survenue</h3>
      <p className="mt-2 text-red-600">{error.message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      )}
    </div>
  );
};

export default ErrorState;