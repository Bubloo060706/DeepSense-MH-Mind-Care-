import LocalDatabase from "../storage/LocalDatabase";

/**
 * SleepFeatures.js
 *
 * Infers sleep from screen-off + sedentary + no-GPS-movement windows.
 * Extracts 3 sleep features:
 *   1. Sleep duration (hours)
 *   2. Sleep midpoint (hour of night, e.g. 2.5 = 2:30 AM)
 *   3. Sleep disruption count (number of screen-on events during sleep)
 *
 * No microphone or dedicated sleep sensor required.
 * Pure behavioral inference from existing sensor data.
 */

const SLEEP_WINDOW_START = 21    // 9 PM — earliest possible sleep
const SLEEP_WINDOW_END   = 11    // 11 AM — latest possible wake
const MIN_SLEEP_HOURS    = 3
const MAX_SLEEP_HOURS    = 12

class SleepFeatures {

  async extract(date = new Date()) {
    const yesterday = new Date(date)
    yesterday.setDate(yesterday.getDate() - 1)

    // Get screen events across sleep window (9PM yesterday → 11AM today)
    const sleepWindowStart = new Date(yesterday)
    sleepWindowStart.setHours(SLEEP_WINDOW_START, 0, 0, 0)

    const sleepWindowEnd = new Date(date)
    sleepWindowEnd.setHours(SLEEP_WINDOW_END, 0, 0, 0)

    const screenEvents = await LocalDatabase.query("sensor_readings", {
      type:  "screen_event",
      since: sleepWindowStart.toISOString(),
      until: sleepWindowEnd.toISOString(),
    })

    const accelReadings = await LocalDatabase.query("sensor_readings", {
      type:  "accelerometer",
      since: sleepWindowStart.toISOString(),
      until: sleepWindowEnd.toISOString(),
    })

    return this._inferSleep(screenEvents, accelReadings, date)
  }

  _inferSleep(screenEvents, accelReadings, date) {
    // Find last screen-off before 2AM = sleep onset proxy
    const screenOffs = screenEvents
      .filter((e) => e.event === "screen_off")
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    const screenOns = screenEvents
      .filter((e) => e.event === "screen_on")
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    if (!screenOffs.length || !screenOns.length) {
      return this._emptyFeatures(date)
    }

    // Sleep onset = last screen-off in evening window
    const eveningOffs = screenOffs.filter((e) => {
      const h = new Date(e.timestamp).getHours()
      return h >= SLEEP_WINDOW_START || h < 4
    })

    // Wake time = first screen-on after 4AM
    const morningOns = screenOns.filter((e) => {
      const h = new Date(e.timestamp).getHours()
      return h >= 4 && h <= SLEEP_WINDOW_END
    })

    if (!eveningOffs.length || !morningOns.length) {
      return this._emptyFeatures(date)
    }

    const sleepOnset = new Date(eveningOffs[eveningOffs.length - 1].timestamp)
    const wakeTime   = new Date(morningOns[0].timestamp)

    // Validate duration
    const durationMs    = wakeTime - sleepOnset
    const durationHours = durationMs / 3600000

    if (durationHours < MIN_SLEEP_HOURS || durationHours > MAX_SLEEP_HOURS) {
      return this._emptyFeatures(date)
    }

    // Sleep midpoint (decimal hour)
    const midpointMs  = sleepOnset.getTime() + durationMs / 2
    const midpointDt  = new Date(midpointMs)
    let   midpointHr  = midpointDt.getHours() + midpointDt.getMinutes() / 60
    // Normalize: hours after midnight (e.g. 2.5 = 2:30 AM)
    if (midpointHr > 12) midpointHr -= 24

    // Disruption count = screen-on events DURING sleep window
    const disruptions = screenOns.filter((e) => {
      const t = new Date(e.timestamp)
      return t > sleepOnset && t < wakeTime
    }).length

    // Cross-check with sedentary bouts during sleep window
    const sedentaryDuring = accelReadings.filter((r) => {
      const t = new Date(r.timestamp)
      return r.is_sedentary && t > sleepOnset && t < wakeTime
    }).length

    return {
      date:                    date.toISOString().slice(0, 10),
      sleep_duration_hrs:      parseFloat(durationHours.toFixed(2)),
      sleep_midpoint_hr:       parseFloat(midpointHr.toFixed(2)),
      sleep_disruption_count:  disruptions,
      sleep_onset:             sleepOnset.toISOString(),
      wake_time:               wakeTime.toISOString(),
      sedentary_during_sleep:  sedentaryDuring,
    }
  }

  _emptyFeatures(date) {
    return {
      date:                   date.toISOString().slice(0, 10),
      sleep_duration_hrs:     0,
      sleep_midpoint_hr:      0,
      sleep_disruption_count: 0,
      sleep_onset:            null,
      wake_time:              null,
      sedentary_during_sleep: 0,
    }
  }
}

export default new SleepFeatures()