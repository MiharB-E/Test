export type User = {
  id: number;
  email: string;
  name: string;
  group_id: number;
};

export type Group = {
  id: number;
  name: string;
  invite_code: string;
};

export type Category = {
  id: number;
  name: string;
  is_default: boolean;
  image_url?: string | null;
};

export type Product = {
  id: number;
  name: string;
  category_id?: number | null;
  category_name?: string;
  quantity: number;
  unit: string;
  unit_type?: 'unit' | 'weight' | 'volume';
  price_per_unit?: number;
  image_url?: string | null;
  status: string;
  group_id: number;
  is_favorite: boolean;
};

export type Purchase = {
  id: number;
  product_id: number;
  user_id: number;
  quantity: number;
  price: number;
  store_name: string;
};

export type ShoppingListItem = {
  id: number;
  product_id: number;
  status: string;
};