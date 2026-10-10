import { haversineDistanceMeters } from './src/common/utils/geo.util.js';

const dist = haversineDistanceMeters(
  { latitude: 23.780856, longitude: 90.40754 },
  { latitude: 23.780562, longitude: 90.417043 }
);

console.log('Distance in meters:', dist);
