// Geocoding service usando OpenRouteService (soporta CORS)
// Recomendado: guardar la API key en .env como VITE_ORS_API_KEY
const ORS_API_KEY = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ORS_API_KEY
  ? import.meta.env.VITE_ORS_API_KEY
  : 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjliYzhiZDJmY2RjMTQxNzRhZGRkM2UyZDUyNWRhYmJiIiwiaCI6Im11cm11cjY0In0=';

const ORS_BASE = 'https://api.openrouteservice.org';

/**
 * Busca una dirección (geocodificación por texto) usando OpenRouteService
 * Retorna { lat, lng, display_name } o null
 */
export const searchAddress = async (query) => {
  if (!query) return null;
  try {
    const url = `${ORS_BASE}/geocode/search?api_key=${encodeURIComponent(ORS_API_KEY)}&text=${encodeURIComponent(query)}&size=1`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error('ORS search error', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const feature = data?.features?.[0];
    if (!feature) return null;
    const [lng, lat] = feature.geometry.coordinates;
    const display_name = feature.properties?.label || feature.properties?.name || query;
    return { lat: parseFloat(lat), lng: parseFloat(lng), display_name };
  } catch (error) {
    console.error('Error en geocodificación (search):', error);
    return null;
  }
};

/**
 * Obtiene la dirección desde coordenadas (reverse geocoding) usando OpenRouteService
 * Retorna { display_name } o null
 */
export const getAddressFromCoords = async (lat, lng) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  try {
    const url = `${ORS_BASE}/geocode/reverse?api_key=${encodeURIComponent(ORS_API_KEY)}&point.lat=${encodeURIComponent(lat)}&point.lon=${encodeURIComponent(lng)}&size=1`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error('ORS reverse error', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const feature = data?.features?.[0];
    const display_name = feature?.properties?.label || null;
    return display_name ? { display_name } : null;
  } catch (error) {
    console.error('Error en geocodificación inversa:', error);
    return null;
  }
};