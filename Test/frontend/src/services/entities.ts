import api from './api';

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  image_url?: string | null;
  group_id?: number | null;
  is_default: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  category_id: number | null;
  category_name?: string;
  quantity: number;
  unit: string;
  unit_type: 'unit' | 'weight' | 'volume';
  price_per_unit: number;
  image_url: string | null;
  status: string;
  group_id: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface Group {
  id: number;
  name: string;
  invite_code: string;
  created_at: string;
}

export interface Purchase {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  user_id: number;
  quantity: number;
  unit: string;
  price: number;
  total_price: number;
  store_name: string;
  created_at: string;
}

export interface ShoppingListItem {
  id: number;
  product_id: number;
  quantity: number;
  status: string;
  created_at: string;
}

// ============ CATEGORÍAS ============
export const fetchCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/categories');
  return response.data;
};

// ============ PRODUCTOS ============
export const fetchProducts = async (category?: string): Promise<Product[]> => {
  const response = await api.get<Product[]>('/products', {
    params: category ? { category } : {}
  });
  return response.data;
};

export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  const response = await api.post('/products', product);
  return response.data;
};

export const markLow = async (id: number): Promise<void> => {
  await api.patch(`/products/${id}/low`);
};

export const toggleFavorite = async (id: number, is_favorite: boolean): Promise<void> => {
  await api.patch(`/products/${id}/favorite`, null, { params: { is_favorite } });
};

// ============ GRUPOS ============
export const createGroup = async (name: string): Promise<Group> => {
  const response = await api.post('/groups', { name });
  return response.data;
};

export const joinGroup = async (invite_code: string): Promise<Group> => {
  const response = await api.post('/groups/join', { invite_code });
  return response.data;
};

export const getMyGroup = async (): Promise<Group> => {
  const response = await api.get('/groups/me');
  return response.data;
};

// ============ COMPRAS ============
export const createPurchase = async (purchase: {
  product_id: number;
  quantity: number;
  price_per_unit: number;
  store_name: string;
}): Promise<Purchase> => {
  const response = await api.post('/purchases', purchase);
  return response.data;
};

export const getRecentPurchases = async (): Promise<Purchase[]> => {
  const response = await api.get('/purchases/recent');
  return response.data;
};

// ============ LISTA DE COMPRA ============
export const fetchShoppingList = async (): Promise<ShoppingListItem[]> => {
  const response = await api.get('/shopping-list');
  return response.data;
};

export const addToShoppingList = async (product_id: number, quantity: number): Promise<ShoppingListItem> => {
  const response = await api.post('/shopping-list', { product_id, quantity });
  return response.data;
};

export const updateShoppingListStatus = async (item_id: number, status: string): Promise<ShoppingListItem> => {
  const response = await api.patch(`/shopping-list/${item_id}/status`, null, { params: { status } });
  return response.data;
};

export const removeShoppingListItem = async (item_id: number): Promise<void> => {
  const response = await api.delete(`/shopping-list/${item_id}`);
  return response.data;
};