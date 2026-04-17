import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { MovieResult } from "@/types/movie";

interface MovieContextType {
  history: MovieResult[];
  addToHistory: (movie: MovieResult) => void;
  clearHistory: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  currentResult: MovieResult | null;
  setCurrentResult: (movie: MovieResult | null) => void;
  isIdentifying: boolean;
  setIsIdentifying: (v: boolean) => void;
  sharedUrl: string | null;
  setSharedUrl: (url: string | null) => void;
}

const MovieContext = createContext<MovieContextType | null>(null);

const HISTORY_KEY = "@cineid_history";
const API_KEY_STORAGE = "@cineid_api_key";

export function MovieProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<MovieResult[]>([]);
  const [apiKey, setApiKeyState] = useState("");
  const [currentResult, setCurrentResult] = useState<MovieResult | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [rawHistory, rawKey] = await Promise.all([
        AsyncStorage.getItem(HISTORY_KEY),
        AsyncStorage.getItem(API_KEY_STORAGE),
      ]);
      if (rawHistory) {
        try {
          setHistory(JSON.parse(rawHistory));
        } catch {}
      }
      if (rawKey) setApiKeyState(rawKey);
    };
    load();
  }, []);

  const addToHistory = useCallback(async (movie: MovieResult) => {
    setHistory((prev) => {
      const filtered = prev.filter((m) => m.id !== movie.id);
      const next = [movie, ...filtered].slice(0, 50);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  }, []);

  const setApiKey = useCallback(async (key: string) => {
    setApiKeyState(key);
    await AsyncStorage.setItem(API_KEY_STORAGE, key);
  }, []);

  return (
    <MovieContext.Provider
      value={{
        history,
        addToHistory,
        clearHistory,
        apiKey,
        setApiKey,
        currentResult,
        setCurrentResult,
        isIdentifying,
        setIsIdentifying,
        sharedUrl,
        setSharedUrl,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
}

export function useMovieContext() {
  const ctx = useContext(MovieContext);
  if (!ctx) throw new Error("useMovieContext must be used within MovieProvider");
  return ctx;
}
