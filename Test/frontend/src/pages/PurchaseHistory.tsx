import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { fetchProducts, Product } from '../services/entities';
import { Package, ShoppingBag, Store, Calendar } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const categoryColor = (name: string) => {
  const key = name?.toLowerCase() || '';
  if (key.includes('lácte') || key.includes('leche')) return 'text-blue-600';
  if (key.includes('bebida')) return 'text-cyan-600';
  if (key.includes('carne')) return 'text-red-600';
  if (key.includes('fruta')) return 'text-green-600';
  if (key.includes('verdura')) return 'text-emerald-600';
  if (key.includes('pan')) return 'text-amber-600';
  if (key.includes('limpieza')) return 'text-indigo-600';
  if (key.includes('higiene')) return 'text-teal-600';
  if (key.includes('suministro')) return 'text-slate-600';
  return 'text-purple-600';
};

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [purchasesRes, productsRes] = await Promise.all([
          api.get('/purchases/history'),
          fetchProducts()
        ]);
        setPurchases(purchasesRes.data || []);
        setProducts(productsRes || []);
      } catch (err: any) {
        console.error('Error cargando historial:', err);
        setError(err?.response?.data?.detail || 'Error cargando historial');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const resolveImageUrl = (url?: string | null) =>
    url?.startsWith('/static/') ? `${API_BASE}${url}` : url;

  const productMap = useMemo(() => {
    const map: Record<number, Product> = {};
    products.forEach((p) => (map[p.id] = p));
    return map;
  }, [products]);

  const purchasesWithCategory = useMemo(() => {
    return purchases.map((p) => ({
      ...p,
      category_name: p.category_name || productMap[p.product_id]?.category_name || 'Sin categoría',
    }));
  }, [purchases, productMap]);

  // ✅ SIMPLE: Si range=month, muestra TODAS las compras (sin filtro de fecha)
  // Así siempre verás las compras que tienes
  const filteredPurchases = useMemo(() => {
    const range = searchParams.get('range');
    if (range === 'month') {
      return purchasesWithCategory;
    }
    return purchasesWithCategory;
  }, [purchasesWithCategory, searchParams]);

  const groupedByCategory = useMemo(() => {
    const map: Record<string, Record<number, any>> = {};
    filteredPurchases.forEach((p) => {
      const cat = p.category_name || 'Sin categoría';
      if (!map[cat]) map[cat] = {};
      if (!map[cat][p.product_id]) {
        map[cat][p.product_id] = { ...p, quantity: 0, total_price: 0 };
      }
      map[cat][p.product_id].quantity += p.quantity;
      map[cat][p.product_id].total_price = (map[cat][p.product_id].total_price || 0) + p.price;
    });
    return map;
  }, [filteredPurchases]);

  const summaryData = useMemo(() => {
    if (purchasesWithCategory.length === 0) return null;

    const byMonth: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const monthsByCategory: Record<string, Set<string>> = {};
    let total = 0;

    for (const p of purchasesWithCategory) {
      const d = new Date(p.created_at);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const cat = p.category_name || 'Sin categoría';
      const amount = p.price || 0;

      total += amount;
      byMonth[monthKey] = (byMonth[monthKey] || 0) + amount;
      byCategory[cat] = (byCategory[cat] || 0) + amount;

      if (!monthsByCategory[cat]) monthsByCategory[cat] = new Set();
      monthsByCategory[cat].add(monthKey);
    }

    const months = Object.keys(byMonth).length || 1;
    const avgMonthly = total / months;

    const avgByCategory: Record<string, number> = {};
    for (const cat of Object.keys(byCategory)) {
      const mCount = monthsByCategory[cat]?.size || 1;
      avgByCategory[cat] = byCategory[cat] / mCount;
    }

    return { total, byMonth, byCategory, avgMonthly, avgByCategory };
  }, [purchasesWithCategory]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  const view = searchParams.get('view');
  const hasPurchases = filteredPurchases.length > 0;

  if (view === 'summary' && summaryData) {
    const cardBase = 'rounded-2xl bg-white p-6 shadow-lg flex items-center justify-between';

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Resumen de gastos</h1>
            <p className="text-sm text-gray-500">Análisis de tus compras</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Volver al dashboard
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className={cardBase}>
            <div>
              <p className="text-sm font-medium text-gray-500">Gasto total</p>
              <p className="mt-2 text-3xl font-bold text-purple-600">{summaryData.total.toFixed(2)}€</p>
              <p className="mt-1 text-xs text-gray-400">Total acumulado</p>
            </div>
            <Package className="h-8 w-8 text-purple-400" />
          </div>

          <div className={cardBase}>
            <div>
              <p className="text-sm font-medium text-gray-500">Promedio mensual</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">{summaryData.avgMonthly.toFixed(2)}€</p>
              <p className="mt-1 text-xs text-gray-400">Media por mes</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Total por categoría</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(summaryData.byCategory).map(([cat, amount]) => (
              <div key={cat} className={cardBase}>
                <div>
                  <p className="text-sm font-medium text-gray-500">{cat}</p>
                  <p className={`mt-2 text-2xl font-bold ${categoryColor(cat)}`}>
                    {amount.toFixed(2)}€
                  </p>
                </div>
                <Package className={`h-8 w-8 ${categoryColor(cat)} opacity-70`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ✅ VISTA PRINCIPAL DEL HISTORIAL
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {searchParams.get('range') === 'month' ? 'Compras del mes' : 'Historial de compras'}
          </h1>
          {hasPurchases && (
            <p className="text-sm text-gray-500">
              {filteredPurchases.length} compra{filteredPurchases.length !== 1 ? 's' : ''} encontrada{filteredPurchases.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          Volver al dashboard
        </button>
      </div>

      {!hasPurchases ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay compras aún</p>
            <button 
              onClick={() => navigate('/purchases')} 
              className="mt-4 btn-primary"
            >
              Registrar primera compra
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(groupedByCategory).map((cat) => (
            <div key={cat}>
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${categoryColor(cat).replace('text', 'bg')}`}></span>
                {cat}
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.values(groupedByCategory[cat]).map((p: any) => (
                  <div key={p.product_id} className="rounded-2xl bg-white p-5 shadow-md hover:shadow-lg transition">
                    <div className="flex items-center gap-3">
                      {p.product_image ? (
                        <img
                          src={resolveImageUrl(p.product_image)}
                          alt={p.product_name}
                          className="h-16 w-16 rounded-xl object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{p.product_name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Store className="h-3 w-3" />
                          <span>{p.store_name || 'Sin tienda'}</span>
                          <span className="mx-1">•</span>
                          <span>{p.quantity} unidad(es)</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-xs text-gray-400">
                        {new Date(p.created_at).toLocaleDateString('es-ES')}
                      </p>
                      <p className="text-xl font-bold text-purple-600">
                        {(p.total_price || p.price || 0).toFixed(2)}€
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}