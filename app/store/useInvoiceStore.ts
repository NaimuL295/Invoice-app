"use server"
import { create } from "zustand";

export type Item = {
  id: number;
  item_name: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
};

type InvoiceStore = {
  items: Item[];
  setItems: (items: Item[]) => void; // <--- Add line
  addItem: (item: Item) => void;
  editItem: (updatedItem: Item) => void;
  deleteItem: (id: number) => void;
  clearItems: () => void;
};

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  items: [],
  setItems: (newItems) => set({ items: newItems }),
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  editItem: (updatedItem) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item,
      ),
    })),
  deleteItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

 clearItems: () => set({ items: [] }),
}));
