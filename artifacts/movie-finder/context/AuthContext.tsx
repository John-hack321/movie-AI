import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from "@/constants/appwrite";

// Required for expo-auth-session to close the browser on redirect
WebBrowser.maybeCompleteAuthSession();

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const USER_STORAGE_KEY = "@cineid_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // expo-auth-session handles the redirect URI automatically:
  // - Expo Go:        exp://192.168.x.x:8081/--/auth  (your local IP)
  // - Dev build:      com.cineid.moviefinder:/auth
  // - Production:     com.cineid.moviefinder:/auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  // Load persisted user on mount
  useEffect(() => {
    AsyncStorage.getItem(USER_STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setUser(JSON.parse(raw)); } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  // Handle the OAuth response automatically
  useEffect(() => {
    if (response?.type === "success") {
      const { accessToken } = response.authentication!;
      fetchGoogleUser(accessToken);
    } else if (response?.type === "error") {
      console.warn("Google sign-in error:", response.error);
      setIsLoading(false);
    }
  }, [response]);

  const fetchGoogleUser = async (accessToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const info = await res.json() as {
        sub?: string;
        name?: string;
        email?: string;
        picture?: string;
      };

      const u: AuthUser = {
        id: info.sub ?? "google_user",
        name: info.name ?? "Google User",
        email: info.email ?? "",
        avatar: info.picture,
      };

      setUser(u);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
    } catch (err) {
      console.warn("Failed to fetch Google user info:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = useCallback(async () => {
    if (!request) return;
    setIsLoading(true);
    try {
      await promptAsync();
      // result is handled by the useEffect above watching `response` 
    } catch (err) {
      console.warn("Google sign-in failed:", err);
      setIsLoading(false);
    }
  }, [request, promptAsync]);

  const signOut = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
