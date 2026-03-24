/**
 * NoiseFilter.js
 *
 * Signal preprocessing utilities for raw sensor data.
 * Implements:
 *   - Median filter       (GPS noise, accelerometer spikes)
 *   - Moving average      (smoothing risk score trends)
 *   - Z-score outlier     (remove extreme accelerometer values)
 *   - Min-max normalizer  (feature scaling before ML inference)
 */

/**
 * Applies a median filter to a numeric array.
 * Effective for removing GPS coordinate jitter and accel spikes.
 *
 * @param {number[]} values  - Raw signal array
 * @param {number}   window  - Kernel size (must be odd)
 * @returns {number[]} Filtered array (same length, edges clamped)
 */
export function medianFilter(values, window = 5) {
  if (window % 2 === 0) window += 1;
  const half   = Math.floor(window / 2);
  const result = [];

  for (let i = 0; i < values.length; i++) {
    const start  = Math.max(0, i - half);
    const end    = Math.min(values.length, i + half + 1);
    const slice  = values.slice(start, end).slice().sort((a, b) => a - b);
    const mid    = Math.floor(slice.length / 2);
    result.push(slice[mid]);
  }

  return result;
}

/**
 * Simple moving average for trend smoothing.
 *
 * @param {number[]} values
 * @param {number}   window
 * @returns {number[]}
 */
export function movingAverage(values, window = 7) {
  const result = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return result;
}

/**
 * Removes outliers using Z-score method.
 * Values beyond `threshold` standard deviations are replaced
 * with the window mean.
 *
 * @param {number[]} values
 * @param {number}   threshold  - Z-score cutoff (default 3.0)
 * @returns {number[]}
 */
export function removeOutliers(values, threshold = 3.0) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std  = Math.sqrt(
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  );

  if (std === 0) return [...values];

  return values.map((v) => {
    const z = Math.abs((v - mean) / std);
    return z > threshold ? mean : v;
  });
}

/**
 * Min-max normalisation to [0, 1].
 * Used to scale features before passing to TFLite model.
 *
 * @param {number[]} values
 * @param {number}   [min]  - Optional fixed min (from training scaler)
 * @param {number}   [max]  - Optional fixed max (from training scaler)
 * @returns {number[]}
 */
export function minMaxNormalize(values, min = null, max = null) {
  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values);

  if (hi === lo) return values.map(() => 0);
  return values.map((v) => (v - lo) / (hi - lo));
}

/**
 * Fills gaps in a time series using last-observation-carry-forward (LOCF).
 * Used when GPS or sensor data has missing windows.
 *
 * @param {(number|null)[]} values  - Array with null gaps
 * @returns {number[]}
 */
export function fillLocf(values) {
  let last = null;
  return values.map((v) => {
    if (v !== null && v !== undefined) {
      last = v;
      return v;
    }
    return last ?? 0;
  });
}

/**
 * Applies the full preprocessing pipeline to a feature vector.
 * Order: LOCF fill → outlier removal → median filter → normalize
 *
 * @param {(number|null)[]} rawValues
 * @param {{ mean: number, scale: number }} scalerParams  - From model_metadata.json
 * @returns {number[]} Preprocessed feature vector
 */
export function preprocessFeatureVector(rawValues, scalerParams = null) {
  let values = fillLocf(rawValues);
  values     = removeOutliers(values, 3.0);
  values     = medianFilter(values, 3);

  // Apply StandardScaler params from training (if provided)
  if (scalerParams) {
    values = values.map(
      (v, i) => (v - scalerParams.mean[i]) / (scalerParams.scale[i] || 1)
    );
  }

  return values;
}