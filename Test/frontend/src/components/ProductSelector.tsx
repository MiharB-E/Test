import { useState } from 'react';
import { 
  Search, Package, X, 
  Apple, Carrot, Beef, 
  Milk, Coffee, SprayCan, 
  Fuel, Snowflake, Candy,
  ShoppingBag, Store, Beer, Egg, Fish, Cookie, WashingMachine
} from 'lucide-react';
import { Product } from '../services/entities';

const categoryIcons: Record<string, any> = {
  'Frutas': Apple,
  'Verduras': Carrot,
  'Carnes': Beef,
  'Panes y Bolleria': ShoppingBag,
  'Lácteos': Milk,
  'Bebidas': Coffee,  // Drink no existe, usamos Coffee
  'Limpieza': SprayCan,
  'Gasolina': Fuel,
  'Congelados': Snowflake,
  'Snacks': Candy,
  'Otros': Package,
};

const categoryColors: Record<string, string> = {
  'Frutas': 'bg-green-100 text-green-600',
  'Verduras': 'bg-green-100 text-green-600',
  'Carnes': 'bg-red-100 text-red-600',
  'Panes y Bolleria': 'bg-amber-100 text-amber-600',
  'Lácteos': 'bg-blue-100 text-blue-600',
  'Bebidas': 'bg-cyan-100 text-cyan-600',
  'Limpieza': 'bg-purple-100 text-purple-600',
  'Gasolina': 'bg-orange-100 text-orange-600',
  'Congelados': 'bg-sky-100 text-sky-600',
  'Snacks': 'bg-pink-100 text-pink-600',
  'Otros': 'bg-gray-100 text-gray-600',
};

interface ProductSelectorProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelect: (product: Product) => void;
  onClear: () => void;
}

export default function ProductSelector({ products, selectedProduct, onSelect, onClear }: ProductSelectorProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Agrupar productos por categoría
  const categories = new Map<string, Product[]>();
  products.forEach(product => {
    const catName = product.category_name || 'Otros';
    if (!categories.has(catName)) categories.set(catName, []);
    categories.get(catName)!.push(product);
  });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (!selectedCategory || (p.category_name || 'Otros') === selectedCategory)
  );

  return (
    <div className="space-y-4">
      {selectedProduct ? (
        <div className="flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 p-3">
          <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center overflow-hidden">
            {selectedProduct.image_url ? (
              <img src={selectedProduct.image_url} alt={selectedProduct.name} className="h-full w-full object-cover" />
            ) : (
              <Package className="h-6 w-6 text-purple-500" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{selectedProduct.name}</p>
            <p className="text-sm text-gray-500">
              {selectedProduct.category_name || 'Sin categoría'} • 
              {selectedProduct.price_per_unit > 0 ? ` $${selectedProduct.price_per_unit} / ${selectedProduct.unit}` : ' Precio no configurado'}
            </p>
          </div>
          <button
            onClick={onClear}
            className="rounded-full p-1 hover:bg-purple-200 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      ) : (
        <>
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 focus:border-purple-400 focus:outline-none"
            />
          </div>

          {/* Categorías */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                !selectedCategory ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            {Array.from(categories.keys()).map(cat => {
              const Icon = categoryIcons[cat] || Package;
              const colorClass = categoryColors[cat] || 'bg-gray-100 text-gray-600';
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
                    selectedCategory === cat ? 'bg-purple-600 text-white' : colorClass
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Lista de productos */}
          {isOpen && filteredProducts.length > 0 && (
            <div className="max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onSelect(product);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className="flex w-full items-center gap-3 p-3 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {product.category_name || 'Sin categoría'} • {product.unit}
                    </p>
                  </div>
                  {product.price_per_unit > 0 && (
                    <p className="text-sm font-medium text-purple-600">
                      ${product.price_per_unit}/{product.unit}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}