import type React from "react";
import { createContext, useState, useContext, useEffect, useCallback } from "react";

const STORAGE_KEY = "selectedCity";

export type CityContextType = {
  selectedCity: string | null;
  setSelectedCity: (city: string | null) => void;
};

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedCity, setSelectedCityState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setSelectedCityState(saved || null);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const setSelectedCity = useCallback((city: string | null) => {
    setSelectedCityState(city);
    if (city !== null) {
      localStorage.setItem(STORAGE_KEY, city);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value: CityContextType = {
    selectedCity: isHydrated ? selectedCity : null,
    setSelectedCity,
  };

  return (
    <CityContext.Provider value={value}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = (): CityContextType => {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error("useCity must be used within a CityProvider");
  }
  return context;
};
