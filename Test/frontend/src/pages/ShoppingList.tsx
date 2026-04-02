import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { Package, MessageSquarePlus } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ShoppingList() {
  const navigate = useNavigate();
  const { products, fetchProducts } = useDataStore();

  const [loading, setLoading] = useState(true);
  const [requestName, setRequestName] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [requests, setRequests] = useState<{ name: string; notes: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchProducts();
      setLoading(false);
    };
    load();
  }, []);

  const resolveImageUrl = (url?: string | null) =>
    url?.startsWith('/static/') ? `${API_BASE}${url}` : url;

  const lowStock = products.filter((p) => p.status === 'low');

  const grouped = useMemo(() => {
    const map: Record<string, typeof lowStock> = {};
    lowStock.forEach((p) => {
      const cat = p.category_name || 'Sin categoría';
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return map;
  }, [lowStock]);

  const orderedCategories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  const submitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestName.trim()) return;
    setRequests((prev) => [...prev, { name: requestName.trim(), notes: requestNotes.trim() }]);
    setRequestName('');
    setRequestNotes('');
  };

  if (loading) return <div className="p-8 text-center">Cargando lista...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Lista de compra</h1>
          <p className="text-gray-500">Productos con stock bajo</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          Volver al dashboard
        </button>
      </div>

      {lowStock.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow-lg text-center">
          <p className="text-gray-600">
            No hay productos en bajo stock.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Revisa lo que tienes en casa y marca los productos como “Me queda poco”.
          </p>
          <button
            onClick={() => navigate('/inventory')}
            className="btn-primary mt-4"
          >
            Ir al inventario
          </button>
        </div>
      ) : (
        <div className="space-y-8">
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

                    <button
                      onClick={() =>
                        navigate(
                          `/purchases/${encodeURIComponent(p.category_name || 'Sin categoría')}?productId=${p.id}&from=low`
                        )
                      }
                      className="btn-secondary"
                    >
                      Registrar compra
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario de solicitud */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquarePlus className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">¿No está en la lista?</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Indícalo aquí y lo añadiremos. Te ayudará a completar tu compra.
        </p>

        <form onSubmit={submitRequest} className="space-y-3">
          <input
            className="input w-full"
            placeholder="Nombre del producto"
            value={requestName}
            onChange={(e) => setRequestName(e.target.value)}
          />
          <textarea
            className="input w-full min-h-[90px]"
            placeholder="Notas (marca, tamaño, detalles...)"
            value={requestNotes}
            onChange={(e) => setRequestNotes(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Enviar solicitud
          </button>
        </form>

        {requests.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Solicitudes recientes</h4>
            <ul className="space-y-2">
              {requests.map((r, i) => (
                <li key={i} className="text-sm text-gray-600">
                  • {r.name} {r.notes && <span className="text-gray-400">— {r.notes}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}