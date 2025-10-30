import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Map, MapPin, Search, Navigation, Check, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para manejar eventos del mapa
const LocationSelector = ({ onLocationSelect, selectedLocation }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });

  return selectedLocation ? (
    <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
  ) : null;
};

// Componente para manejar el movimiento del mapa
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.length === 2) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

const MapLocationPicker = ({ onLocationConfirm, onClose, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([-12.0464, -77.0428]); // Lima, Perú por defecto
  const [zoom, setZoom] = useState(12);
  const mapRef = useRef();

  useEffect(() => {
    // Intentar obtener la ubicación actual del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setZoom(15);
        },
        (error) => {
          console.log('No se pudo obtener la ubicación:', error);
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Función para buscar una dirección
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      // Usar API de Nominatim (gratuita) para geocodificación
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=pe`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        setMapCenter([lat, lng]);
        setZoom(17); // Zoom apropiado para búsqueda
        setSelectedLocation({ lat, lng });
        setAddress(result.display_name);
      } else {
        alert('No se encontró la dirección. Intenta con una búsqueda más específica.');
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      alert('Error al buscar la dirección');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener la dirección desde coordenadas (geocodificación inversa)
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
    }
  };

  // Manejar selección de ubicación en el mapa
  const handleLocationSelect = (latlng) => {
    setSelectedLocation({ lat: latlng.lat, lng: latlng.lng });
    getAddressFromCoords(latlng.lat, latlng.lng);
  };

  // Confirmar ubicación seleccionada
  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationConfirm({
        coordinates: selectedLocation,
        address: address,
        timestamp: new Date()
      });
    }
  };

  // Usar mi ubicación actual
  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setSelectedLocation(location);
          setMapCenter([latitude, longitude]);
          setZoom(18); // Zoom más cercano para ubicación actual
          getAddressFromCoords(latitude, longitude);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          let errorMessage = 'No se pudo obtener tu ubicación actual';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso denegado. Por favor, permite el acceso a tu ubicación en el navegador.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Ubicación no disponible. Verifica tu conexión GPS.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado. Intenta nuevamente.';
              break;
          }
          
          alert(errorMessage);
          setIsLoading(false);
        },
        { 
          timeout: 15000, 
          enableHighAccuracy: true,
          maximumAge: 60000 // Cache por 1 minuto
        }
      );
    } else {
      alert('La geolocalización no está disponible en tu navegador');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Map className="w-5 h-5 text-cyan-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Selecciona tu ubicación
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Buscador */}
          <div className="mt-4 flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar dirección (ej: Av. Javier Prado 123, San Isidro)"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </button>
            <button
              onClick={useCurrentLocation}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
            >
              <Navigation className="w-4 h-4" />
              <span>{isLoading ? 'Obteniendo...' : 'Mi ubicación'}</span>
            </button>
          </div>
        </div>

        {/* Mapa */}
        <div className="flex-1 relative">
          <MapContainer
            center={mapCenter}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={mapCenter} zoom={zoom} />
            <LocationSelector 
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
            />
          </MapContainer>
          
          {/* Indicador de clic */}
          <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>Haz clic en el mapa para seleccionar tu ubicación</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {/* Dirección seleccionada */}
          {address && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Ubicación seleccionada:</p>
                  <p className="text-sm text-gray-600">{address}</p>
                  {selectedLocation && (
                    <p className="text-xs text-gray-500 mt-1">
                      Coordenadas: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Botones */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmLocation}
              disabled={!selectedLocation}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar ubicación</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLocationPicker;