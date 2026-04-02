import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyCode } from '../services/auth';

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verifyCode(email, code);
      navigate('/login', { state: { message: '¡Cuenta verificada! Inicia sesión.' } });
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.detail || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-800">Verifica tu cuenta</h1>
        <p className="mt-2 text-sm text-gray-500">
          Ingresa el código de 6 dígitos enviado a <strong>{email || 'tu email'}</strong>
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Código de verificación"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-2xl tracking-widest focus:border-purple-400 focus:outline-none"
            maxLength={6}
            inputMode="numeric"
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700"
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Verificar cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
