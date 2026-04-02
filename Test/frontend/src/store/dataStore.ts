import { create } from 'zustand';
import { Product, fetchProducts, markLow, toggleFavorite } from '../services/entities';

interface DataState {
  products: Product[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  markLow: (id: number) => Promise<void>;
  toggleFavorite: (id: number, isFavorite: boolean) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  products: [],
  loading: false,

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const products = await fetchProducts();
      // Asegurar que cada producto tiene category_name
      const productsWithCategory = products.map(p => ({
        ...p,
        category_name: p.category_name || 'Sin categoría'
      }));
      set({ products: productsWithCategory, loading: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ loading: false });
    }
  },

  markLow: async (id) => {
    await markLow(id);
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, status: 'low' } : p
      ),
    }));
  },

  toggleFavorite: async (id, isFavorite) => {
    await toggleFavorite(id, isFavorite);
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, is_favorite: isFavorite } : p
      ),
    }));
  },
}));