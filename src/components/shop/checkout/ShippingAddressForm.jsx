import { useState } from 'react';
import { MapPin } from "lucide-react";
import MapLocationPicker from "../../shared/MapLocationPicker";
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

const ShippingAddressForm = ({ 
  formData, 
  errors, 
  selectedLocation, 
  onChange, 
  onLocationSelect 
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleInputChange = (e) => {
    onChange(e.target.name, e.target.value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 transition-colors duration-300">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-cyan-600 dark:text-cyan-400" />
        Dirección de Envío
      </h2>

      <div className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dirección *
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 sm:py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors ${
              errors.address 
                ? "border-red-500 dark:border-red-400" 
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="Av. Principal 123, Dpto 456"
          />
          {errors.address && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">
              {errors.address}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ciudad *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 sm:py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors ${
                errors.city 
                  ? "border-red-500 dark:border-red-400" 
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Cochabamba"
            />
            {errors.city && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.city}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código Postal *
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 sm:py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors ${
                errors.zipCode
                  ? "border-red-500 dark:border-red-400"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="0000"
            />
            {errors.zipCode && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.zipCode}
              </p>
            )}
          </div>
        </div>

        {/* Selector de ubicación en el mapa (abrir modal) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ubicación (Opcional)
          </label>
          <div className="space-y-3">
            {selectedLocation ? (
              (() => {
                // Soporta dos formas: { lat, lng } o { coordinates: { lat, lng }, address }
                const raw = selectedLocation.coordinates ? selectedLocation.coordinates : selectedLocation;
                const lat = raw && raw.lat ? Number(raw.lat) : null;
                const lng = raw && raw.lng ? Number(raw.lng) : null;
                const coords = (lat !== null && !Number.isNaN(lat) && lng !== null && !Number.isNaN(lng)) ? { lat, lng } : null;

                return (
                  <div>
                    <div className="mb-3">
                      <p className="font-medium text-gray-900 dark:text-white">Ubicación seleccionada</p>
                      {selectedLocation.address && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">{selectedLocation.address}</p>
                      )}
                    </div>

                    {coords ? (
                      <div className="rounded-lg overflow-hidden border border-gray-200">
                        <MapContainer center={[coords.lat, coords.lng]} zoom={15} style={{ height: 180, width: '100%' }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                          <Marker position={[coords.lat, coords.lng]} />
                        </MapContainer>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Coordenadas no disponibles</p>
                    )}

                    <div className="mt-2 flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowPicker(true)}
                        className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm"
                      >
                        Editar ubicación
                      </button>
                      <button
                        type="button"
                        onClick={() => onLocationSelect(null)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        Quitar ubicación
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex-1 text-sm text-gray-600 dark:text-gray-300">
                  <p className="text-sm text-gray-500">No has seleccionado una ubicación todavía.</p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm"
                  >
                    Seleccionar en el mapa
                  </button>
                </div>
              </div>
            )}
          </div>

          {showPicker && (
            <MapLocationPicker
              onLocationConfirm={(loc) => {
                // loc puede venir como { coordinates: {lat,lng}, address } o { lat,lng }
                const normalized = {};
                if (loc?.coordinates && typeof loc.coordinates.lat !== 'undefined') {
                  normalized.coordinates = {
                    lat: Number(loc.coordinates.lat),
                    lng: Number(loc.coordinates.lng)
                  };
                } else if (typeof loc?.lat !== 'undefined' && typeof loc?.lng !== 'undefined') {
                  normalized.coordinates = { lat: Number(loc.lat), lng: Number(loc.lng) };
                }
                if (loc?.address) normalized.address = loc.address;

                // Actualizar el formData.address si la dirección fue resuelta
                if (normalized.address) {
                  onChange('address', normalized.address);
                }

                // Pasar al hook la ubicación normalizada (permitirá al form renderizar el mini-mapa)
                onLocationSelect(normalized);
                setShowPicker(false);
              }}
              onClose={() => setShowPicker(false)}
              initialLocation={selectedLocation}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingAddressForm;