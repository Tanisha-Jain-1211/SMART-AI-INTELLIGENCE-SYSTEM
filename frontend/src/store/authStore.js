// Stores authenticated user state and token across the app (persisted locally).
import { create } from "zustand";

function readStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const useAuthStore = create((set) => ({
  user: readStoredUser(),
  token: localStorage.getItem("token"),
  setUser: (user) => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
    set({ user });
  },
  setToken: (token) => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    set({ token });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  }
}));

export default useAuthStore;
