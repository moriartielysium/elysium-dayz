import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  items: [],
  addItem(item) {
    const existing = get().items.find((x) => x.id === item.id);
    if (existing) {
      set({
        items: get().items.map((x) =>
          x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x
        )
      });
      return;
    }
    set({ items: [...get().items, { ...item, quantity: 1 }] });
  },
  removeItem(id) {
    set({ items: get().items.filter((x) => x.id !== id) });
  },
  clear() {
    set({ items: [] });
  }
}));
