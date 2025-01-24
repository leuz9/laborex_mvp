import React from 'react';
import { Clock } from 'lucide-react';

interface Props {
  createdAt: string;
}

export default function RequestTimeInfo({ createdAt }: Props) {
  return (
    <div className="border-b pb-4">
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <Clock className="mr-2" size={20} />
        Informations temporelles
      </h3>
      <p className="text-gray-600">
        Créée le : {new Date(createdAt).toLocaleString()}
      </p>
    </div>
  );
}