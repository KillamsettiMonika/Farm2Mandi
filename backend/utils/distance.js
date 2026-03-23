/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  
  // Convert degrees to radians
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.cos(lat1 * Math.PI / 180) * 
    Math.cos(lat2 * Math.PI / 180) * 
    Math.cos(dLon) +
    Math.sin(lat1 * Math.PI / 180) * 
    Math.sin(lat2 * Math.PI / 180);
  
  const c = Math.acos(Math.max(-1, Math.min(1, a))); // Clamp to [-1, 1] to avoid NaN
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

module.exports = { calculateDistance };
