import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { MapPin, Edit } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const LocationDisplay = ({ location, onEdit, editable = true }) => {
  if (!location || !location.coordinates) {
    return null;
  }

  const { coordinates, address } = location;

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Ubicación confirmada</p>
            <p className="text-sm text-gray-600 mt-1">{address}</p>
            <p className="text-xs text-gray-500 mt-1">
              {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </p>
          </div>
        </div>
        {editable && (
          <button
            onClick={onEdit}
            className="text-cyan-600 hover:text-cyan-800 text-sm font-medium flex items-center space-x-1"
          >
            <Edit className="w-3 h-3" />
            <span>Cambiar</span>
          </button>
        )}
      </div>
      
      {/* Mini mapa */}
      <div className="h-32 rounded-lg overflow-hidden border">
        <MapContainer
          center={[coordinates.lat, coordinates.lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          dragging={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[coordinates.lat, coordinates.lng]} />
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationDisplay;