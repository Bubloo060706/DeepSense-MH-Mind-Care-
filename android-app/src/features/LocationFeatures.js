import GpsSensor from "../sensors/GpsSensor";
import { medianFilter, removeOutliers } from "../preprocessing/NoiseFilter";

/**
 * LocationFeatures.js
 *
 * Extracts 4 location-based behavioral features from raw GPS readings:
 *   1. Radius of gyration     — spatial range of movement
 *   2. Home stay %            — time spent at inferred home location
 *   3. Location entropy       — diversity of visited places
 *   4. Num places visited     — distinct cluster count (DBSCAN-lite)
 *
 * All features are computed on-device. Raw lat/lng is never sent
 * to the backend — only the derived scalar features.
 */

const HOME_RADIUS_M      = 100;    // meters — radius to consider "at home"
const CLUSTER_RADIUS_M   = 50;     // meters — radius for place clustering
const MIN_CLUSTER_POINTS = 3;      // DBSCAN min points per cluster
const EARTH_RADIUS_M     = 6371000;

// --- Haversine distance ---
function haversineM(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat  = toRad(lat2 - lat1);
  const dLon  = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- Centroid of a set of points ---
function centroid(points) {
  const lat = points.reduce((s, p) => s + p.latitude,  0) / points.length;
  const lon = points.reduce((s, p) => s + p.longitude, 0) / points.length;
  return { latitude: lat, longitude: lon };
}

// --- Simple DBSCAN-lite for place clustering ---
function clusterPlaces(points, radius = CLUSTER_RADIUS_M, minPts = MIN_CLUSTER_POINTS) {
  const visited = new Set();
  const clusters = [];

  for (let i = 0; i < points.length; i++) {
    if (visited.has(i)) continue;
    visited.add(i);

    const neighbors = points
      .map((p, j) => ({ j, dist: haversineM(points[i].latitude, points[i].longitude, p.latitude, p.longitude) }))
      .filter(({ j, dist }) => j !== i && dist <= radius)
      .map(({ j }) => j);

    if (neighbors.length < minPts - 1) continue;

    const cluster = [i, ...neighbors];
    neighbors.forEach((j) => visited.add(j));
    clusters.push(cluster.map((idx) => points[idx]));
  }

  return clusters;
}

// --- Radius of gyration ---
function radiusOfGyration(points) {
  if (points.length < 2) return 0;
  const c   = centroid(points);
  const msd = points.reduce(
    (sum, p) => sum + haversineM(p.latitude, p.longitude, c.latitude, c.longitude) ** 2,
    0
  ) / points.length;
  return Math.sqrt(msd);
}

// --- Shannon entropy ---
function shannonEntropy(counts) {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  return -counts
    .map((c) => c / total)
    .filter((p) => p > 0)
    .reduce((sum, p) => sum + p * Math.log2(p), 0);
}

class LocationFeatures {

  async extract(date = new Date()) {
    const readings = await GpsSensor.getRecentReadings(24);

    if (readings.length < 5) {
      return this._emptyFeatures(date);
    }

    // Smooth GPS coordinates
    const lats = medianFilter(readings.map((r) => r.latitude),  5);
    const lons = medianFilter(readings.map((r) => r.longitude), 5);
    const cleanedLats = removeOutliers(lats, 3.0);
    const cleanedLons = removeOutliers(lons, 3.0);

    const points = cleanedLats.map((lat, i) => ({
      latitude:  lat,
      longitude: cleanedLons[i],
      timestamp: readings[i].timestamp,
    }));

    // Infer home = most visited cluster in early morning hours (00:00–06:00)
    const nightPoints = points.filter((p) => {
      const h = new Date(p.timestamp).getHours();
      return h >= 0 && h <= 6;
    });
    const homeCenter = nightPoints.length >= 3
      ? centroid(nightPoints)
      : centroid(points.slice(0, 3));

    // Home stay %
    const homePoints   = points.filter(
      (p) => haversineM(p.latitude, p.longitude, homeCenter.latitude, homeCenter.longitude) <= HOME_RADIUS_M
    );
    const homeStayPct  = (homePoints.length / points.length) * 100;

    // Radius of gyration
    const rog = radiusOfGyration(points);

    // Place clusters
    const clusters    = clusterPlaces(points);
    const numPlaces   = clusters.length;

    // Location entropy (based on time spent per cluster)
    const clusterSizes = clusters.map((c) => c.length);
    const entropy      = shannonEntropy(clusterSizes);

    return {
      date:               date.toISOString().slice(0, 10),
      radius_of_gyration: Math.round(rog),
      home_stay_pct:      parseFloat(homeStayPct.toFixed(2)),
      location_entropy:   parseFloat(entropy.toFixed(4)),
      num_places_visited: numPlaces,
      sample_count:       points.length,
    };
  }

  _emptyFeatures(date) {
    return {
      date:               date.toISOString().slice(0, 10),
      radius_of_gyration: 0,
      home_stay_pct:      100,
      location_entropy:   0,
      num_places_visited: 0,
      sample_count:       0,
    };
  }
}

export default new LocationFeatures();