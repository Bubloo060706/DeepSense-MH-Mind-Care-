// ─────────────────────────────────────────────
//  useSensors Hook
// ─────────────────────────────────────────────

import { useCallback, useState, useEffect, useRef } from 'react';
import SensorService from '../services/sensorService';

export const useSensors = () => {
  const [sensorData, setSensorData] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  const initialize = useCallback(async () => {
    try {
      const initialized = await SensorService.initialize();
      return initialized;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  const startMonitoring = useCallback((interval = 5000) => {
    try {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      unsubscribeRef.current = SensorService.subscribe((data) => {
        setSensorData(data);
      });

      SensorService.startMonitoring(interval);
      setIsActive(true);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const stopMonitoring = useCallback(() => {
    try {
      SensorService.stopMonitoring();
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      setIsActive(false);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const getCurrentReading = useCallback(async () => {
    try {
      const reading = await SensorService.getCurrentReading();
      return reading;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const getHeartRateData = useCallback(async (hours = 24) => {
    try {
      const data = await SensorService.getHeartRateData(hours);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  const getActivityData = useCallback(async (days = 7) => {
    try {
      const data = await SensorService.getActivityData(days);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  const getSleepData = useCallback(async (days = 7) => {
    try {
      const data = await SensorService.getSleepData(days);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  const getStressLevel = useCallback(async () => {
    try {
      const data = await SensorService.getStressLevel();
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    sensorData,
    isActive,
    error,
    initialize,
    startMonitoring,
    stopMonitoring,
    getCurrentReading,
    getHeartRateData,
    getActivityData,
    getSleepData,
    getStressLevel,
  };
};

export default useSensors;
