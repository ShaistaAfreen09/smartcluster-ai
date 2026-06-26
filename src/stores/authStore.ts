import { create } from "zustand";
import { CyberUser, loginWithGoogle, logoutUser } from "../services/auth";

interface AuthState {
  user: CyberUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: CyberUser | null) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const cachedUser = localStorage.getItem("smartcluster_user");
  const initialUser = cachedUser ? JSON.parse(cachedUser) : null;

  return {
    user: initialUser,
    loading: false,
    error: null,
    isAuthenticated: !!initialUser,
    setUser: (user) => {
      if (user) {
        localStorage.setItem("smartcluster_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("smartcluster_user");
      }
      set({ user, isAuthenticated: !!user, loading: false });
    },
    login: async () => {
      set({ loading: true, error: null });
      try {
        const user = await loginWithGoogle();
        localStorage.setItem("smartcluster_user", JSON.stringify(user));
        set({ user, isAuthenticated: true, loading: false });
      } catch (err: any) {
        set({ error: err.message || "Failed to authenticate with Google", loading: false });
      }
    },
    logout: async () => {
      set({ loading: true });
      try {
        await logoutUser();
        localStorage.removeItem("smartcluster_user");
        set({ user: null, isAuthenticated: false, loading: false });
      } catch (err: any) {
        set({ error: err.message || "Signout failed", loading: false });
      }
    }
  };
});

// Proactive session validation on boot & refresh
fetch("/api/users/me")
  .then((res) => {
    if (res.ok) return res.json();
    throw new Error();
  })
  .then((data) => {
    useAuthStore.getState().setUser(data.user);
  })
  .catch(() => {
    // If telemetry token expired, wipe local cache safely
    useAuthStore.getState().setUser(null);
  });

