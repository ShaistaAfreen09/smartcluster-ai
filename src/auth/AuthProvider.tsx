import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  workspaceRole: "Viewer" | "Operator" | "Admin";
  clusterAccess: string[];
  loginTimestamp: string;
  preferences?: {
    theme: "light" | "dark";
    notifications: boolean;
    dashboardLayout: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserProfile["preferences"]>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: storeUser, setUser: setStoreUser } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync state between Zustand store and AuthProvider
  const user = storeUser as UserProfile | null;

  const refreshSession = async () => {
    try {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        setStoreUser(data.user);
        setError(null);
      } else {
        // Token might have expired
        setStoreUser(null);
      }
    } catch (err: any) {
      console.error("Failed to restore session:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  // Listen for login completion from OAuth popup callback
  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
        return;
      }

      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        setLoading(true);
        setError(null);
        try {
          // Callback succeeded. Let's fetch the new authenticated user profile!
          const res = await fetch("/api/users/me");
          if (!res.ok) {
            throw new Error("Unable to retrieve profile from server after successful login.");
          }
          const data = await res.json();
          setStoreUser(data.user);
        } catch (err: any) {
          setError(err.message || "Authentication verification failed.");
          setStoreUser(null);
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [setStoreUser]);

  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Google OAuth URL from Express backend
      const res = await fetch("/api/auth/google/url");
      if (!res.ok) {
        throw new Error("Server authentication endpoints unavailable.");
      }
      const { url } = await res.json();

      // Open Consent popup
      const width = 550;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const authWindow = window.open(
        url,
        "Google Sign In",
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
      );

      if (!authWindow) {
        throw new Error("Popup blocked by browser. Please enable popups for this dashboard.");
      }
    } catch (err: any) {
      setError(err.message || "OAuth instantiation failed.");
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setStoreUser(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Log out request failed.");
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (prefs: Partial<UserProfile["preferences"]>) => {
    if (!user) return;
    try {
      const res = await fetch("/api/users/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: prefs }),
      });
      if (res.ok) {
        const data = await res.json();
        setStoreUser(data.user);
      }
    } catch (err) {
      console.error("Failed to update user preferences:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, updatePreferences, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be wrapped inside AuthProvider");
  }
  return context;
}
