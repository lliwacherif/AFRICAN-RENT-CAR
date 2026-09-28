/**
 * Routing and Geocoding Utility for Chauffeur Lines in Tunisia
 */

// Popular locations in Tunisia for quick snapping & preset picking
export const TUNISIA_LOCATIONS_PRESETS = [
  { name: 'Aéroport Tunis-Carthage (TUN)', lat: 36.8510, lng: 10.2272, group: 'Aéroports' },
  { name: 'Aéroport Enfidha-Hammamet (NBE)', lat: 36.0758, lng: 10.4386, group: 'Aéroports' },
  { name: 'Aéroport Djerba-Zarzis (DJE)', lat: 33.8750, lng: 10.7753, group: 'Aéroports' },
  { name: 'Aéroport Monastir Habib Bourguiba (MIR)', lat: 35.7581, lng: 10.7547, group: 'Aéroports' },
  { name: 'Tunis Centre-Ville (Avenue Habib Bourguiba)', lat: 36.8008, lng: 10.1800, group: 'Grand Tunis' },
  { name: 'La Marsa & Sidi Bou Saïd', lat: 36.8782, lng: 10.3418, group: 'Grand Tunis' },
  { name: 'Les Berges du Lac (Lac 1 & Lac 2)', lat: 36.8329, lng: 10.2343, group: 'Grand Tunis' },
  { name: 'Gammarth Zone Hôtelière & Résidences', lat: 36.9189, lng: 10.2925, group: 'Grand Tunis' },
  { name: 'Hammamet Centre & Médina', lat: 36.4000, lng: 10.6167, group: 'Cap Bon' },
  { name: 'Hammamet Sud & Yasmine Hammamet', lat: 36.3768, lng: 10.5518, group: 'Cap Bon' },
  { name: 'Nabeul Centre', lat: 36.4561, lng: 10.7376, group: 'Cap Bon' },
  { name: 'Sousse Sahloul & Cliniques', lat: 35.8360, lng: 10.5982, group: 'Sahel' },
  { name: 'Sousse Centre & Port El Kantaoui', lat: 35.8920, lng: 10.5985, group: 'Sahel' },
  { name: 'Monastir Centre & Marina', lat: 35.7770, lng: 10.8261, group: 'Sahel' },
  { name: 'Mahdia Zone Touristique', lat: 35.5047, lng: 11.0622, group: 'Sahel' },
  { name: 'Bizerte Centre & Vieux Port', lat: 37.2746, lng: 9.8739, group: 'Nord' },
  { name: 'Tabarka & Aïn Draham', lat: 36.9544, lng: 8.7580, group: 'Nord' },
  { name: 'Sfax Centre & Thyna', lat: 34.7406, lng: 10.7603, group: 'Centre / Sud' },
  { name: 'Djerba Midoun & Zone Hôtelière', lat: 33.8078, lng: 10.9923, group: 'Sud' },
  { name: 'Djerba Houmt Souk', lat: 33.8759, lng: 10.8575, group: 'Sud' },
  { name: 'Zarzis Centre & Plages', lat: 33.5040, lng: 11.1122, group: 'Sud' },
  { name: 'Tozeur & Oasis', lat: 33.9197, lng: 8.1335, group: 'Sud' },
];

/**
 * Format duration in hours and minutes
 */
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '30 min';
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes < 10 ? '0' : ''}${minutes} min`;
}

/**
 * Format distance in kilometers
 */
export function formatDistance(meters) {
  if (!meters || meters <= 0) return '10 km';
  const km = Math.round(meters / 1000);
  return `${km} km`;
}

/**
 * Calculate Great Circle Distance in meters (fallback)
 */
export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Generate interpolated fallback trail if routing API is unreachable
 */
export function generateFallbackTrail(fromCoords, toCoords, count = 25) {
  const trail = [];
  const lat1 = fromCoords.lat;
  const lng1 = fromCoords.lng;
  const lat2 = toCoords.lat;
  const lng2 = toCoords.lng;

  for (let i = 0; i <= count; i++) {
    const t = i / count;
    // Slight curve to look natural
    const curveOffset = Math.sin(t * Math.PI) * 0.015;
    const lat = lat1 + (lat2 - lat1) * t + curveOffset;
    const lng = lng1 + (lng2 - lng1) * t;
    trail.push([lat, lng]);
  }
  return trail;
}

/**
 * Fetch driving trail between two coordinates using OSRM
 * Returns { trail: Array<[lat, lng]>, distanceStr, durationStr, distanceMeters, durationSeconds }
 */
export async function fetchDrivingRoute(fromCoords, toCoords) {
  if (!fromCoords || !toCoords) return null;

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}?overview=full&geometries=geojson`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // OSRM GeoJSON coords are [lng, lat], Leaflet expects [lat, lng]
        const trail = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        return {
          trail,
          distanceStr: formatDistance(route.distance),
          durationStr: formatDuration(route.duration),
          distanceMeters: route.distance,
          durationSeconds: route.duration,
        };
      }
    }
  } catch (err) {
    console.warn('OSRM routing request failed or timed out, using fallback curvature:', err.message);
  }

  // Fallback calculation
  const straightDistMeters = haversineDistanceMeters(
    fromCoords.lat,
    fromCoords.lng,
    toCoords.lat,
    toCoords.lng
  );
  // Real driving road distance is typically ~1.25x straight-line distance
  const estimatedRoadDistMeters = straightDistMeters * 1.25;
  // Average highway/road speed ~75 km/h
  const estimatedSeconds = (estimatedRoadDistMeters / 1000 / 75) * 3600;

  return {
    trail: generateFallbackTrail(fromCoords, toCoords),
    distanceStr: formatDistance(estimatedRoadDistMeters),
    durationStr: formatDuration(estimatedSeconds),
    distanceMeters: estimatedRoadDistMeters,
    durationSeconds: estimatedSeconds,
  };
}

/**
 * Reverse Geocode coordinates to place name using OpenStreetMap Nominatim
 */
export async function reverseGeocodeCoords(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept-Language': 'fr' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.display_name) {
        const addr = data.address || {};
        const town = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || addr.state;
        const main = addr.aeroway || addr.tourism || addr.amenity || addr.road || '';
        if (main && town) {
          return `${main}, ${town}`;
        }
        return town || data.display_name.split(',')[0];
      }
    }
  } catch (err) {
    console.warn('Reverse geocoding error:', err.message);
  }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
