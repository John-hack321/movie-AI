import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  GOOGLE_WEB_CLIENT_ID,
} from "@/constants/appwrite";

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

  // Load persisted user on mount
  useEffect(() => {
    AsyncStorage.getItem(USER_STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setUser(JSON.parse(raw));
        } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  const persistUser = async (u: AuthUser | null) => {
    if (u) {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
    } else {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const signInWithGoogle = useCallback(async () => {
    // If no Google client ID is configured, fall back to demo/guest mode
    if (!GOOGLE_WEB_CLIENT_ID) {
      const guest: AuthUser = {
        id: "guest_" + Date.now().toString(),
        name: "Guest User",
        email: "guest@cineid.app",
      };
      setUser(guest);
      await persistUser(guest);
      return;
    }

    setIsLoading(true);
    try {
      const redirectUri = Linking.createURL("auth");
      const scope = encodeURIComponent("openid profile email");
      const googleAuthUrl =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${encodeURIComponent(GOOGLE_WEB_CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token` +
        `&scope=${scope}`;

      const result = await WebBrowser.openAuthSessionAsync(googleAuthUrl, redirectUri);

      if (result.type === "success" && result.url) {
        const fragment = result.url.split("#")[1] ?? "";
        const params = Object.fromEntries(
          fragment.split("&").map((p) => {
            const [k, v] = p.split("=");
            return [k, decodeURIComponent(v ?? "")];
          })
        );
        const accessToken = params["access_token"];
        if (accessToken) {
          const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const info = await infoRes.json() as {
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
          await persistUser(u);
        }
      }
    } catch (err) {
      console.warn("Google sign in failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    await persistUser(null);
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
