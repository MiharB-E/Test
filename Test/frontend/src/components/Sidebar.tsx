import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  LogOut,
  ChevronRight,
  Home,
  History,
  Star
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-purple-500' },
  { name: 'Inventario', href: '/inventory', icon: Package, color: 'text-blue-500' },
  { name: 'Lista de compra', href: '/shopping', icon: ShoppingCart, color: 'text-green-500' },
  { name: 'Compras', href: '/purchases', icon: CreditCard, color: 'text-orange-500' },
  { name: 'Favoritos', href: '/purchases/Favoritos', icon: Star, color: 'text-yellow-400' },
  { name: 'Historial', href: '/history', icon: History, color: 'text-yellow-500' },
  { name: 'Grupos', href: '/groups', icon: Users, color: 'text-pink-500' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside 
      className={`fixed left-0 top-0 z-30 flex h-screen flex-col bg-gradient-to-b from-purple-900 to-purple-800 transition-all duration-300 lg:sticky lg:top-0 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className={`flex h-20 shrink-0 items-center border-b border-purple-700/50 px-6 ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">InvCasa</h1>
              <p className="text-xs text-purple-300">Gestión del hogar</p>
            </div>
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Home className="h-6 w-6 text-white" />
          </div>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-transform hover:bg-purple-500 hover:scale-110"
      >
        {/* ✅ Flecha correcta: colapsado => apunta a la derecha */}
        <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${!collapsed ? 'rotate-180' : ''}`} />
      </button>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/purchases'}
                className={({ isActive }) => `
                  group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-purple-200 hover:bg-white/10 hover:text-white'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
                {!collapsed && <span>{item.name}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-2 hidden rounded-lg bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap group-hover:block">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className={`shrink-0 border-t border-purple-700/50 p-4 ${collapsed ? 'text-center' : ''}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 ring-2 ring-purple-400">
            <span className="text-sm font-medium text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
            </span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name || (user?.email?.split('@')[0] || 'Usuario')}
              </p>
              <p className="truncate text-xs text-purple-300">
                {user?.email || 'usuario@email.com'}
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={handleLogout}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition-all hover:bg-red-500/20 hover:text-red-200 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}