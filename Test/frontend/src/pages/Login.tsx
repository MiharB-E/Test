import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('demo@invcasa.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>('');
  const successMessage = location.state?.message;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDebug('Iniciando login...');

    const ok = await login(email.toLowerCase().trim(), password);

    if (!ok) {
      setError('Login failed');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token NO se guardó en LocalStorage');
      return;
    }

    setDebug('Login OK, redirigiendo...');
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-800">InvCasa</h1>
        <p className="mt-2 text-sm text-gray-500">Inicia sesión para continuar</p>

        {successMessage && (
          <p className="mt-3 rounded-lg bg-green-50 p-2 text-sm text-green-700">
            {successMessage}
          </p>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" className="btn-primary w-full">
            Ingresar
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-purple-600 hover:underline">
            Regístrate
          </Link>
        </p>

        {debug && (
          <pre className="mt-4 text-xs bg-gray-100 p-3 rounded-xl overflow-auto">
            {debug}
          </pre>
        )}
      </div>
    </div>
  );
}