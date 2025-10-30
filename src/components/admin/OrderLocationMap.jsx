import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, User, Package, Calendar } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const OrderLocationMap = ({ order, className = "" }) => {
  const location = order.customer?.location;
  
  if (!location || !location.coordinates) {
    return (
      <div className={`border border-gray-300 rounded-lg p-4 bg-gray-50 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-500">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">No hay ubicación disponible para este pedido</span>
        </div>
      </div>
    );
  }

  const { coordinates, address } = location;

  return (
    <div className={className}>
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Ubicación de entrega</p>
              <p className="text-sm text-gray-600 mt-1">{address}</p>
              <p className="text-xs text-gray-500 mt-1">
                Coordenadas: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="h-64">
          <MapContainer
            center={[coordinates.lat, coordinates.lng]}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[coordinates.lat, coordinates.lng]}>
              <Popup>
                <div className="min-w-48">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="w-4 h-4 text-cyan-600" />
                    <span className="font-medium">
                      Pedido #{order.orderNumber || order.id.slice(0, 8)}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-3 h-3 text-gray-500" />
                      <span>
                        {order.customer?.firstName} {order.customer?.lastName}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <span>
                        {order.createdAt?.toDate ? 
                          order.createdAt.toDate().toLocaleDateString() : 
                          new Date(order.createdAt).toLocaleDateString()
                        }
                      </span>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600">{address}</p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default OrderLocationMap;