import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Store, User } from 'lucide-react';
import type { Pharmacy } from '../types';
import { mockPharmacies, mockUsers } from '../mockData';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const pharmacyIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const clientIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapView() {
  // Centre de Dakar
  const center = { lat: 14.7167, lng: -17.4677 };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Cartographie</h2>
      <div className="h-[600px] rounded-lg overflow-hidden">
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Marqueurs des pharmacies */}
          {mockPharmacies.map((pharmacy) => (
            <Marker
              key={pharmacy.id}
              position={[pharmacy.location.latitude, pharmacy.location.longitude]}
              icon={pharmacyIcon}
            >
              <Popup>
                <div className="p-2">
                  <div className="flex items-center mb-2">
                    <Store className="w-4 h-4 mr-2 text-green-600" />
                    <h3 className="font-medium">{pharmacy.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{pharmacy.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Marqueurs des clients avec demandes en cours */}
          {mockUsers
            .filter(user => user.role === 'client')
            .map((user) => (
              <Marker
                key={user.id}
                position={[14.7167 + Math.random() * 0.02, -17.4677 + Math.random() * 0.02]}
                icon={clientIcon}
              >
                <Popup>
                  <div className="p-2">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 mr-2 text-blue-600" />
                      <h3 className="font-medium">{user.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
      <div className="mt-4 flex items-center space-x-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm">Pharmacies</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm">Clients</span>
        </div>
      </div>
    </div>
  );
}