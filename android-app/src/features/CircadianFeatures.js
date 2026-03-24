import LocalDatabase from "../storage/LocalDatabase";

/**
 * CircadianFeatures.js
 *
 * Extracts circadian rhythm features using a simplified
 * Lomb-Scargle-inspired approach on activity time series.
 *
 * Features extracted:
 *   1. Circadian index     — strength of 24h activity periodicity (0–1)
 *   2. Interdaily stability (IS) — consistency across days
 *   3. Intradaily variability (IV) — fragmentation within a day
 *
 * Reference: Van Someren et al. (1999) — non-parametric circadian analysis.
 * Adapted for mobile JS without FFT library dependency.
 */

const BINS_PER_DAY  = 24    // hourly activity bins
const MIN_DAYS      = 3     // minimum days needed for IS/IV

class CircadianFeatures {

  async extract(date = new Date()) {
    // Fetch 7 days of accelerometer summaries
    const since = new Date(date)
    since.setDate(since.getDate() - 7)

    const readings = await LocalDatabase.query("sensor_readings", {
      type:  "accelerometer",
      since: since.toISOString(),
      until: date.toISOString(),
    })

    if (readings.length < BINS_PER_DAY * MIN_DAYS) {
      return this._emptyFeatures(date)
    }

    // Build hourly activity array (mean_mag per hour)
    const hourlyBins = this._buildHourlyBins(readings)

    const circadianIndex      = this._circadianIndex(hourlyBins)
    const interdailyStability = this._interdailyStability(hourlyBins)
    const intradailyVariability = this._intradailyVariability(hourlyBins)

    return {
      date:                    date.toISOString().slice(0, 10),
      circadian_index:         parseFloat(circadianIndex.toFixed(4)),
      interdaily_stability:    parseFloat(interdailyStability.toFixed(4)),
      intradaily_variability:  parseFloat(intradailyVariability.toFixed(4)),
      days_analyzed:           Math.floor(readings.length / BINS_PER_DAY),
    }
  }

  _buildHourlyBins(readings) {
    // Group readings by hour-of-day across all days
    const bins = Array.from({ length: BINS_PER_DAY }, () => [])

    readings.forEach((r) => {
      const hour = new Date(r.timestamp).getHours()
      bins[hour].push(r.mean_mag || 0)
    })

    // Average each bin
    return bins.map((b) =>
      b.length ? b.reduce((a, v) => a + v, 0) / b.length : 0
    )
  }

  _circadianIndex(hourlyBins) {
    // Ratio of daytime (6AM-10PM) activity to total activity
    const daytimeBins  = hourlyBins.slice(6, 22)
    const nightBins    = [...hourlyBins.slice(0, 6), ...hourlyBins.slice(22)]

    const dayMean   = _mean(daytimeBins)
    const nightMean = _mean(nightBins)
    const total     = dayMean + nightMean

    if (total === 0) return 0
    return dayMean / total
  }

  _interdailyStability(hourlyBins) {
    // IS = variance of average day / overall variance
    // Higher IS = more consistent day-to-day rhythm
    const overallMean = _mean(hourlyBins)
    const overallVar  = _variance(hourlyBins)

    if (overallVar === 0) return 1

    const binVar = hourlyBins.reduce(
      (sum, v) => sum + (v - overallMean) ** 2, 0
    ) / hourlyBins.length

    return Math.min(1, binVar / overallVar)
  }

  _intradailyVariability(hourlyBins) {
    // IV = mean of squared successive differences / overall variance
    // Higher IV = more fragmented, irregular rhythm (worse sleep quality signal)
    if (hourlyBins.length < 2) return 0

    const overallVar = _variance(hourlyBins)
    if (overallVar === 0) return 0

    let sumSqDiff = 0
    for (let i = 1; i < hourlyBins.length; i++) {
      sumSqDiff += (hourlyBins[i] - hourlyBins[i - 1]) ** 2
    }

    const msd = sumSqDiff / (hourlyBins.length - 1)
    return Math.min(2, msd / overallVar)   // capped at 2 per convention
  }

  _emptyFeatures(date) {
    return {
      date:                   date.toISOString().slice(0, 10),
      circadian_index:        0,
      interdaily_stability:   0,
      intradaily_variability: 0,
      days_analyzed:          0,
    }
  }
}

function _mean(arr) {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function _variance(arr) {
  if (arr.length < 2) return 0
  const m = _mean(arr)
  return arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length
}

export default new CircadianFeatures()