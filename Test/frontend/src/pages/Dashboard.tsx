import { useEffect, useState } from 'react';
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import RecentPurchases from '../components/RecentPurchases';
import CategoryChart from '../components/CategoryChart';
import MonthlyTrendChart from '../components/MonthlyTrendChart';
import {
  getDashboardStats,
  getRecentPurchases,
  getCategorySpending,
  getMonthlyTrend,
  DashboardStats,
  RecentPurchase,
  CategorySpending,
  MonthlyTrend,
} from '../services/dashboard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, purchasesData, categoryData, trendData] = await Promise.all([
          getDashboardStats(),
          getRecentPurchases(),
          getCategorySpending(),
          getMonthlyTrend(),
        ]);

        setStats(statsData);
        setRecentPurchases(purchasesData);
        setCategorySpending(categoryData);
        setMonthlyTrend(trendData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Bienvenido de vuelta. Aquí está el resumen de tu hogar.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total productos"
          value={stats?.totalProducts || 0}
          icon={<Package className="h-6 w-6" />}
          color="purple"
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="Compras este mes"
          value={stats?.monthlyPurchases || 0}
          icon={<ShoppingCart className="h-6 w-6" />}
          color="green"
          onClick={() => navigate('/history?range=month')}
        />
        <StatCard
          title="Gasto mensual"
          value={`${(stats?.monthlySpending || 0).toFixed(2)}€`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="blue"
          onClick={() => navigate('/history?view=summary')}
        />
        <StatCard
          title="Productos con stock bajo"
          value={stats?.lowStockProducts || 0}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="orange"
          onClick={() => navigate('/inventory?filter=low')}
        />
        <StatCard
          title="Favoritos"
          value={stats?.favoriteProducts || 0}
          icon={<Star className="h-6 w-6" />}
          color="purple"
          onClick={() => navigate('/purchases/Favoritos')}
        />
        <StatCard
          title="Grupo activo"
          value={stats?.activeGroups || 1}
          icon={<Users className="h-6 w-6" />}
          color="blue"
          onClick={() => navigate('/groups')}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyTrendChart data={monthlyTrend} />
        <CategoryChart data={categorySpending} />
      </div>

      <RecentPurchases purchases={recentPurchases} />
    </div>
  );
}