import React, { createContext, useContext, useState } from 'react';

export const AppStateContext = createContext({});

export const AppStateProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Alex Kumar',
    email: 'alex@mindpulse.io',
    age: 24,
    joined: 'March 2025',
  });
  const [scenario, setScenario] = useState('moderate'); // healthy | mild | moderate | severe | critical
  const [moodLog, setMoodLog] = useState([]);
  const [phqHistory, setPhqHistory] = useState([]);

  const addMoodEntry = (entry) =>
    setMoodLog((prev) => [{ ...entry, id: Date.now(), ts: new Date().toISOString() }, ...prev]);

  const addPhqResult = (result) =>
    setPhqHistory((prev) => [{ ...result, id: Date.now(), ts: new Date().toISOString() }, ...prev]);

  return (
    <AppStateContext.Provider
      value={{ user, setUser, scenario, setScenario, moodLog, addMoodEntry, phqHistory, addPhqResult }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);
