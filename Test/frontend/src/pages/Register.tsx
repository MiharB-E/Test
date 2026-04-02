import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/auth';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    last_name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.name.trim() || !form.last_name.trim()) {
      setError('Nombre y apellido son obligatorios.');
      setLoading(false);
      return;
    }

    try {
      const response = await register({
        email: form.email,
        password: form.password,
        name: form.name.trim(),
        last_name: form.last_name.trim(),
      });
      navigate('/verify', { state: { email: response.email } });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-800">Crear cuenta</h1>
        <p className="mt-2 text-sm text-gray-500">Regístrate para comenzar</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 focus:border-purple-400 focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Apellido"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 focus:border-purple-400 focus:outline-none"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 focus:border-purple-400 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 focus:border-purple-400 focus:outline-none"
            required
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
          <button 
            type="submit" 
            className="w-full rounded-xl bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-purple-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}