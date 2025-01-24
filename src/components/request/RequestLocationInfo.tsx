import React from 'react';
import { MapPin } from 'lucide-react';
import type { Location } from '../../types';

interface Props {
  location: Location;
}

export default function RequestLocationInfo({ location }: Props) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <MapPin className="mr-2" size={20} />
        Localisation
      </h3>
      <p className="text-gray-600">
        Latitude : {location.latitude}
        <br />
        Longitude : {location.longitude}
      </p>
    </div>
  );
}