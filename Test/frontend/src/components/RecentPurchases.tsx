import { ShoppingBagIcon } from 'lucide-react';
import { RecentPurchase } from '../services/dashboard';

interface RecentPurchasesProps {
  purchases: RecentPurchase[];
}

export default function RecentPurchases({ purchases }: RecentPurchasesProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Compras recientes</h3>
        <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {purchases.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hay compras recientes</p>
        ) : (
          purchases.map((purchase) => (
            <div key={purchase.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{purchase.product_name}</p>
                <p className="text-sm text-gray-500">{purchase.store_name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${purchase.price.toFixed(2)}</p>
                <p className="text-xs text-gray-400">x{purchase.quantity}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}