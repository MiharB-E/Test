import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { addToShoppingList } from '../services/entities';
import { Package } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Inventory() {
  const { products, fetchProducts, markLow, toggleFavorite } = useDataStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState('');
  const [showLow, setShowLow] = useState(false);
  const [showFavs, setShowFavs] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Refrescar al volver a esta página
  useEffect(() => {
    fetchProducts();
  }, [location.key]);

  // ✅ Refrescar cuando vuelves a la pestaña (muy útil si compras en otra vista)
  useEffect(() => {
    const onFocus = () => fetchProducts();
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchProducts();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  useEffect(() => {
    const f = searchParams.get('filter');
    if (f === 'low') {
      setShowLow(true);
      setShowFavs(false);
    } else if (f === 'favorites') {
      setShowFavs(true);
      setShowLow(false);
    }
  }, [searchParams]);

  const resolveImageUrl = (url?: string | null) =>
    url?.startsWith('/static/') ? `${API_BASE}${url}` : url;

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) &&
      (!showLow || p.status === 'low') &&
      (!showFavs || p.is_favorite)
  );

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    filtered.forEach((p) => {
      const cat = p.category_name || 'Sin categoría';
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return map;
  }, [filtered]);

  const orderedCategories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  const isLowView = searchParams.get('filter') === 'low';

  return (
    <div>
      <div className="flex items-center">
        <div className="w-32" /> {/* spacer left to keep title centered */}
        <div className="flex-1 text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            {isLowView ? 'Productos de bajo stock' : 'Inventario'}
          </h1>

          {!isLowView && (showLow || showFavs) && (
              <p className="mt-2 text-base font-semibold text-purple-600">
                {showLow ? 'Filtrado: Stock bajo' : 'Filtrado: Favoritos'}
              </p>
            )}
        </div>

        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          Volver al dashboard
        </button>
      </div>

      {!isLowView && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <input
            className="input max-w-md w-full sm:w-96"
            placeholder="Buscar producto..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <button onClick={() => setShowLow(!showLow)} className="btn-secondary">
            {showLow ? 'Mostrar todos' : 'Solo stock bajo'}
          </button>
          <button onClick={() => setShowFavs(!showFavs)} className="btn-secondary">
            {showFavs ? 'Todos' : 'Solo favoritos'}
          </button>
        </div>
      )}

      <div className="mt-6 space-y-8">
        {filtered.length === 0 && <p className="text-gray-500">No hay productos</p>}

        {orderedCategories.map((category) => (
          <div key={category}>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">{category}</h2>

            <div className="space-y-3">
              {grouped[category].map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                      {p.image_url ? (
                        <img
                          src={resolveImageUrl(p.image_url) || ''}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-sm text-gray-500">
                        {p.quantity} {p.unit} • Estado: {p.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isLowView ? (
                    <button
                      onClick={() =>
                        navigate(`/purchases/${encodeURIComponent(p.category_name || 'Sin categoría')}?productId=${p.id}&from=low`)
                      }
                      className="btn-secondary"
                    >
                      Registrar compra
                    </button>
                  ) : (
                    <>
                      <button onClick={() => markLow(p.id)} className="btn-secondary">
                        Me queda poco
                      </button>
                      <button
                        onClick={() => toggleFavorite(p.id, !p.is_favorite)}
                        className={`btn-secondary ${p.is_favorite ? 'bg-yellow-100' : ''}`}
                      >
                        {p.is_favorite ? '★' : '☆'}
                      </button>
                    </>
                  )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}