// Cache for geocoded addresses to avoid repeated API calls
const geocodeCache = new Map<string, { lat: number; lon: number } | null>();
const failedCache = new Set<string>(); // Prevent retrying permanently failed lookups

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Estimate travel time in minutes based on distance
 * Uses average urban driving speed of 25 km/h
 */
export function estimateTravelTime(distanceKm: number): number {
  const avgSpeedKmH = 25; // Average urban driving speed
  const timeHours = distanceKm / avgSpeedKmH;
  return Math.round(timeHours * 60);
}

/**
 * Geocode an address using OpenStreetMap Nominatim API
 * Returns coordinates or null if not found
 * Note: Nominatim has usage limits - 1 request per second
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lon: number } | null> {
  const cacheKey = address.toLowerCase().trim();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) || null;
  }
  if (failedCache.has(cacheKey)) {
    return null;
  }

  try {
    // Add ", India" to improve geocoding accuracy for Indian addresses
    const searchQuery = address.includes('India') ? address : `${address}, India`;
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
          // Nominatim requires a valid User-Agent
          'User-Agent': 'PadosiAgent/1.0',
        },
      }
    );

    if (!response.ok) {
      console.warn('Geocoding request failed:', response.status);
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
      geocodeCache.set(cacheKey, result);
      return result;
    }

    geocodeCache.set(cacheKey, null);
    return null;
  } catch (error) {
    // Don't spam console — silently cache failures
    failedCache.add(cacheKey);
    return null;
  }
}

/**
 * Calculate distance and travel time from user location to an address
 */
export async function getDistanceToAddress(
  userLat: number,
  userLon: number,
  address: string
): Promise<{ distanceKm: number; travelTimeMin: number } | null> {
  const coords = await geocodeAddress(address);
  
  if (!coords) {
    return null;
  }

  const distanceKm = calculateHaversineDistance(
    userLat,
    userLon,
    coords.lat,
    coords.lon
  );

  const travelTimeMin = estimateTravelTime(distanceKm);

  return { distanceKm, travelTimeMin };
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Format travel time for display
 */
export function formatTravelTime(minutes: number): string {
  if (minutes < 1) {
    return '< 1 min';
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
