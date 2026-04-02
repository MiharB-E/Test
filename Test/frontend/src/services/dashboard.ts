import api from './api';

export interface DashboardStats {
  totalProducts: number;
  monthlyPurchases: number;
  monthlySpending: number;
  lowStockProducts: number;
  favoriteProducts: number;
  activeGroups: number;
}

export interface RecentPurchase {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  store_name: string;
  created_at: string;
}

export interface CategorySpending {
  category: string;
  amount: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  amount: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/dashboard/stats');
  return response.data;
};

export const getRecentPurchases = async (): Promise<RecentPurchase[]> => {
  try {
    const response = await api.get<RecentPurchase[]>('/purchases/recent');
    return response.data ?? [];
  } catch {
    return [];
  }
};

export const getCategorySpending = async (): Promise<CategorySpending[]> => {
  try {
    const response = await api.get<CategorySpending[]>('/dashboard/category-spending');
    return response.data ?? [];
  } catch {
    return [];
  }
};

export const getMonthlyTrend = async (): Promise<MonthlyTrend[]> => {
  try {
    const response = await api.get<MonthlyTrend[]>('/dashboard/monthly-trend');
    return response.data ?? [];
  } catch {
    return [];
  }
};
