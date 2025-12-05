// Utility functions for location handling and distance calculation

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Get user's current location using the browser's geolocation API
 */
export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 600000, // 10 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location access denied by user'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information unavailable'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out'));
            break;
          default:
            reject(new Error('An unknown error occurred while retrieving location'));
            break;
        }
      },
      options
    );
  });
};

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param coord1 First coordinate (user location)
 * @param coord2 Second coordinate (restaurant/deal location)
 * @returns Distance in kilometers
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted distance string
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)} km`;
  } else {
    return `${Math.round(distance)} km`;
  }
};

/**
 * Default coordinates for Toronto (fallback location)
 */
export const DEFAULT_COORDINATES: Coordinates = {
  latitude: 43.6532, // Toronto latitude
  longitude: -79.3832, // Toronto longitude
};

export interface LocationData {
  latitude?: number | string;
  longitude?: number | string;
  streetAddress?: string;
  city?: string;
  province?: string;
}

/**
 * Get location coordinates from restaurant/deal data
 * Handles both direct coordinates and address-based fallbacks
 */
export const getLocationCoordinates = (locationData: LocationData): Coordinates | null => {
  // Check if we have direct coordinates
  if (locationData.latitude && locationData.longitude) {
    return {
      latitude: parseFloat(locationData.latitude.toString()),
      longitude: parseFloat(locationData.longitude.toString()),
    };
  }
  return null;
};

/**
 * Opens the native map application or Google Maps in a new tab with directions to the specified location.
 * Prioritizes coordinates if available, otherwise falls back to address.
 * Can optionally specify an origin address.
 */
export const openMapNavigation = (
  latitude?: number | string,
  longitude?: number | string,
  addressParts?: (string | undefined | null)[],
  origin?: string
): boolean => {
  let destination = '';

  if (latitude && longitude) {
    destination = `${latitude},${longitude}`;
  } else if (addressParts && addressParts.length > 0) {
    const validParts = addressParts.filter(Boolean);
    if (validParts.length > 0) {
      destination = encodeURIComponent(validParts.join(', '));
    }
  }

  if (destination) {
    let url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    if (origin) {
      url += `&origin=${encodeURIComponent(origin)}`;
    }
    window.open(url, '_blank');
    return true;
  }
  
  return false;
};

/**
 * Formats a restaurant address for display.
 * Handles various edge cases and missing data.
 */
export const formatAddress = (
  streetAddress?: string,
  city?: string,
  province?: string
): string => {
  const cleanCity = city?.trim();
  const cleanProvince = province?.trim();
  const cleanStreet = streetAddress?.trim();

  const isValid = (val?: string) => 
    val && 
    val !== '' && 
    val.toLowerCase() !== 'unknown' && 
    val.toLowerCase() !== 'location not set' && 
    val.toLowerCase() !== 'null';

  const hasValidCity = isValid(cleanCity);
  const hasValidProvince = isValid(cleanProvince);
  const hasValidAddress = isValid(cleanStreet);
  
  if (hasValidAddress) {
    return cleanStreet!;
  } else if (hasValidCity && hasValidProvince) {
    return `${cleanCity}, ${cleanProvince}`;
  } else if (hasValidCity) {
    return cleanCity!;
  } else if (hasValidProvince) {
    return cleanProvince!;
  } else {
    return 'Unknown';
  }
};

