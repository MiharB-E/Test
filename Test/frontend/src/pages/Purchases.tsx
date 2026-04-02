import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, Category } from '../services/entities';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Purchases() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState<Map<number, string>>(new Map());
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data);
        const urls = new Map<number, string>();
        data.forEach((cat) => {
          const url = getImageUrl(cat);
          urls.set(cat.id, url);
        });
        setImageUrls(urls);
      })
      .catch(() => setError('No se pudieron cargar categorías. Inicia sesión.'))
      .finally(() => setLoading(false));
  }, []);

  const getImageUrl = (category: Category): string => {
    const exactMapping: Record<string, string> = {
      'Frutas': 'frutas.webp',
      'Verduras': 'verduras.webp',
      'Carnes': 'carnes.webp',
      'Panes y Bollería': 'panes.webp',
      'Panes y Bolleria': 'panes.webp',
      'Panés y Bollería': 'panes.webp',
      'Lácteos': 'lacteos.webp',
      'Bebidas': 'bebidas.webp',
      'Limpieza': 'limpieza.webp',
      'Gasolina': 'gasolina.webp',
      'Congelados': 'congelados.webp',
      'Snacks': 'snacks.webp'
    };

    if (category.image_url && category.image_url.trim() !== '') {
      let url = category.image_url;
      
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      
      let filename = url.split('/').pop() || '';
      filename = filename.toLowerCase();
      
      if (!filename.endsWith('.webp')) {
        filename = filename.replace(/\.(jpg|jpeg|png)$/i, '') + '.webp';
      }
      
      if (exactMapping[category.name]) {
        return `${API_BASE}/static/categories/${exactMapping[category.name]}`;
      }
      
      return `${API_BASE}/static/categories/${filename}`;
    }
    
    if (exactMapping[category.name]) {
      return `${API_BASE}/static/categories/${exactMapping[category.name]}`;
    }
    
    const genericFilename = `${category.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.webp`;
    return `${API_BASE}/static/categories/${genericFilename}`;
  };

  if (loading) return <div className="p-8 text-center">Cargando categorías...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registrar compra</h1>
          <p className="text-gray-500">Selecciona una categoría</p>
        </div>
        <button
          onClick={() => navigate('/purchases/Favoritos')}
          className="rounded-xl bg-purple-600 px-5 py-2 text-white font-medium hover:bg-purple-700 transition"
        >
          ⭐ Comprar favoritos
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const imageUrl = imageUrls.get(cat.id) || '';
          
          return (
            <button
              key={cat.id}
              onClick={() => navigate(`/purchases/${encodeURIComponent(cat.name)}`)}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 bg-white"
            >
              <div className="h-40 w-full overflow-hidden bg-gray-100">
                <img
                  src={imageUrl}
                  alt={cat.name}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'h-full w-full flex items-center justify-center text-7xl font-bold bg-gradient-to-br from-gray-100 to-gray-200';
                      fallback.textContent = cat.name.charAt(0).toUpperCase();
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 w-full p-4 text-left">
                <div className="text-white text-lg font-semibold">{cat.name}</div>
                <div className="text-white/70 text-sm">Ver productos</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}