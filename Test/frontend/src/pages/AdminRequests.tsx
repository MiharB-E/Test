import { useEffect, useState } from 'react';
import api from '../services/api';

interface ShoppingRequest {
  id: number;
  name: string;
  notes?: string;
  resolved: boolean;
  created_at: string;
  resolved_at?: string;
  user_name?: string;
  user_email?: string;
}

export default function AdminRequests() {
  const [items, setItems] = useState<ShoppingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await api.get('/shopping-list/requests');
    setItems(res.data || []);
    setLoading(false);
  };

  const resolve = async (id: number) => {
    await api.patch(`/shopping-list/requests/${id}/resolve`);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-8 text-center">Cargando solicitudes...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Solicitudes de productos</h1>
        <p className="text-gray-500">Panel admin del grupo</p>
      </div>

      {items.length === 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-lg text-center text-gray-500">
          No hay solicitudes pendientes
        </div>
      )}

      <div className="space-y-3">
        {items.map((r) => (
          <div key={r.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{r.name}</p>
                <p className="text-sm text-gray-500">{r.notes || '—'}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {r.user_name || 'Usuario'} • {r.user_email || 'Sin email'}
                </p>
              </div>
              {!r.resolved ? (
                <button onClick={() => resolve(r.id)} className="btn-primary">
                  Marcar resuelto
                </button>
              ) : (
                <span className="text-sm text-green-600 font-medium">Resuelto</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}