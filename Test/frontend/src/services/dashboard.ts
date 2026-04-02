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
  const response = await api.get('/dashboard/stats');
  return response.data;
};

// ✅ CORREGIDO: Usar el endpoint de history para compras recientes
export const getRecentPurchases = async (): Promise<RecentPurchase[]> => {
  const response = await api.get('/purchases/history');
  const purchases = response.data || [];
  
  // Devolver las últimas 5 compras ordenadas por fecha
  return purchases
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((p: any) => ({
      id: p.id,
      product_name: p.product_name,
      quantity: p.quantity,
      price: p.price,
      store_name: p.store_name,
      created_at: p.created_at
    }));
};

// ✅ Usar el endpoint de history para categorías
export const getCategorySpending = async (): Promise<CategorySpending[]> => {
  const response = await api.get('/purchases/history');
  const purchases = response.data || [];
  
  // Agrupar por categoría
  const categoryMap: Record<string, number> = {};
  purchases.forEach((p: any) => {
    const cat = p.category_name || 'Sin categoría';
    categoryMap[cat] = (categoryMap[cat] || 0) + (p.price || 0);
  });
  
  const colors = ["#9333ea", "#c084fc", "#e9d5ff", "#7e22ce", "#a855f7", "#3b82f6", "#10b981"];
  
  return Object.entries(categoryMap).map(([category, amount], i) => ({
    category,
    amount,
    color: colors[i % colors.length]
  }));
};

// ✅ Usar el endpoint de history para evolución mensual
export const getMonthlyTrend = async (): Promise<MonthlyTrend[]> => {
  const response = await api.get('/purchases/history');
  const purchases = response.data || [];
  
  // Agrupar por mes
  const monthMap: Record<string, number> = {};
  purchases.forEach((p: any) => {
    if (p.created_at) {
      const date = new Date(p.created_at);
      const monthKey = date.toLocaleString('es', { month: 'short', year: 'numeric' });
      monthMap[monthKey] = (monthMap[monthKey] || 0) + (p.price || 0);
    }
  });
  
  // Ordenar por fecha
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const sorted = Object.entries(monthMap).sort((a, b) => {
    const [aMonth, aYear] = a[0].split(' ');
    const [bMonth, bYear] = b[0].split(' ');
    if (aYear !== bYear) return parseInt(aYear) - parseInt(bYear);
    return months.indexOf(aMonth.toLowerCase()) - months.indexOf(bMonth.toLowerCase());
  });
  
  return sorted.map(([month, amount]) => ({
    month,
    amount
  }));
};