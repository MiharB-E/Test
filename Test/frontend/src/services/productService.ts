import api from "./api";
import { Product } from "../types";

export const fetchProducts = () => api.get<Product[]>("/products");

export const createProduct = (payload: Partial<Product>) =>
  api.post<Product>("/products", payload);

export const markLow = (id: number) => api.patch(`/products/${id}/low`);

export const toggleFavorite = (id: number, isFavorite: boolean) =>
  api.patch(`/products/${id}/favorite`, { is_favorite: isFavorite });