import { create } from "zustand";

export const useGuildStore = create((set) => ({
  selectedGuild: null,
  setSelectedGuild: (guild) => set({ selectedGuild: guild })
}));
