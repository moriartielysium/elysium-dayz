import { create } from "zustand";
import { getMe } from "../lib/auth";

export const useAuthStore = create((set) => ({
  me: null,
  loading: false,
  error: null,
  async hydrate() {
    set({ loading: true, error: null });
    try {
      const payload = await getMe();
      set({ me: payload, loading: false, error: null });
    } catch (error) {
      set({ me: null, loading: false, error: error.message });
    }
  }
}));
