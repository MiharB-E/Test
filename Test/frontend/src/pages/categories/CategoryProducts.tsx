import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Package, Store, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { fetchProducts, Product } from '../../services/entities';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function CategoryProducts() {
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unitType, setUnitType] = useState<'unit' | 'weight'>('unit');
  const [price, setPrice] = useState('');
  const [storeName, setStoreName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categoryDisplayName = decodeURIComponent(categoryName || '');
  const isFavorites = categoryDisplayName === 'Favoritos';
  const from = searchParams.get('from');

  useEffect(() => {
    if (isFavorites) {
      fetchProducts(undefined).then((all) => {
        setProducts(all.filter((p) => p.is_favorite));
        setLoading(false);
      });
    } else {
      fetchProducts(categoryDisplayName)
        .then((data) => {
          setProducts(data);
          setLoading(false);

          const productId = searchParams.get('productId');
          if (productId) {
            const found = data.find((p) => p.id === Number(productId));
            if (found) handleProductSelect(found);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [categoryDisplayName]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setUnitType(product.unit_type === 'weight' ? 'weight' : 'unit');
    setPrice('');
  };

  const resolveImageUrl = (url?: string | null) =>
    url?.startsWith('/static/') ? `${API_BASE}${url}` : url;

  const toggleUnitType = async () => {
    if (!selectedProduct) return;

    const next = unitType === 'weight' ? 'unit' : 'weight';
    setUnitType(next);

    try {
      await api.patch(`/products/${selectedProduct.id}/unit`, null, {
        params: { unit_type: next }
      });
    } catch (e) {
      setUnitType(unitType);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProduct) return;
    if (quantity <= 0) return setError('Cantidad inválida');
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) return setError('Precio inválido');

    setSubmitting(true);
    setError('');

    try {
      await api.post(`/products/${selectedProduct.id}/purchase`, null, {
        params: {
          quantity: quantity,
          price_per_unit: priceValue,
          store_name: storeName.trim() || 'Sin tienda'
        }
      });

            setSuccess(true);

            if (from === 'low') {
              navigate('/inventory?filter=low', { replace: true });
              return;
            }

            setSelectedProduct(null);
            setQuantity(1);
            setPrice('');
            setStoreName('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al registrar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={() => navigate('/purchases')}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Volver a categorías
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryDisplayName}</h1>
      <p className="text-gray-500 mb-6">{products.length} productos disponibles</p>

      {!selectedProduct ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProductSelect(p)}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden"
            >
              <div className="h-36 bg-gray-100 overflow-hidden">
                {p.image_url ? (
                  <img
                    src={resolveImageUrl(p.image_url) || ''}
                    alt={p.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4 text-left">
                <div className="font-semibold text-gray-900">{p.name}</div>
                <div className="text-sm text-gray-500">
                  {p.unit_type === 'weight' ? 'Por kg' : 'Por unidad'}
                </div>
                {p.price_per_unit > 0 && (
                  <div className="mt-1 text-sm text-purple-600 font-medium">
                    {p.price_per_unit}€ / {p.unit_type === 'weight' ? 'kg' : 'unidad'}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-52 bg-gray-100">
              {selectedProduct.image_url ? (
                <img
                  src={resolveImageUrl(selectedProduct.image_url) || ''}
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Package className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold text-gray-900">{selectedProduct.name}</p>
                  <p className="text-sm text-gray-500">
                    {unitType === 'weight' ? 'Venta por kg' : 'Venta por unidad'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleUnitType();
                  }}
                  className="text-purple-600 text-sm"
                >
                  Cambiar
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <h2 className="text-lg font-semibold mb-3">Cantidad</h2>
              <div className="flex gap-2">
                <input
                  type="number"
                  step={unitType === 'weight' ? '0.1' : '1'}
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:border-purple-400 focus:outline-none"
                />
                <div className="rounded-xl bg-gray-100 px-4 py-3 text-gray-700">
                  {unitType === 'weight' ? 'kg' : 'unidades'}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg">
              <h2 className="text-lg font-semibold mb-3">Precio</h2>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder={`Precio por ${unitType === 'weight' ? 'kg' : 'unidad'}`}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-8 pr-4 focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg">
              <h2 className="text-lg font-semibold mb-3">Tienda</h2>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nombre de la tienda"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 text-white">
              <h2 className="text-lg font-semibold mb-4">Resumen</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Producto</span>
                  <span>{selectedProduct.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cantidad</span>
                  <span>
                    {quantity} {unitType === 'weight' ? 'kg' : 'unidades'}
                  </span>
                </div>
                {price && (
                  <div className="flex justify-between">
                    <span>Precio unitario</span>
                    <span>{parseFloat(price).toFixed(2)}€</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-white/20">
                  <span>Total</span>
                  <span>{price ? (quantity * parseFloat(price)).toFixed(2) : '0.00'}€</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !price}
                className="mt-6 w-full bg-white text-purple-900 py-3 rounded-xl font-semibold hover:scale-105 transition disabled:opacity-50 disabled:scale-100"
              >
                {submitting ? 'Registrando...' : 'Registrar compra'}
              </button>

              {success && (
                <div className="mt-4 bg-green-500/20 rounded-xl p-3 text-green-200 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Compra registrada con éxito
                </div>
              )}
              {error && (
                <div className="mt-4 bg-red-500/20 rounded-xl p-3 text-red-200 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}