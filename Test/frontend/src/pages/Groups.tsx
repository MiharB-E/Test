import { useEffect, useState } from 'react';
import { Users, UserPlus, UserCheck, Copy, Check, Share2, Home, Users2 } from 'lucide-react';
import { createGroup, joinGroup, getMyGroup, Group } from '../services/entities';

export default function Groups() {
  const [group, setGroup] = useState<Group | null>(null);
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyGroup()
      .then((g) => setGroup(g))
      .catch(() => null);
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Ingresa un nombre para el grupo');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const g = await createGroup(name);
      setGroup(g);
      setName('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al crear grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setError('Ingresa un código de invitación');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const g = await joinGroup(inviteCode);
      setGroup(g);
      setInviteCode('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (group?.invite_code) {
      navigator.clipboard.writeText(group.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header centrado */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-2xl mb-4">
          <Users2 className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Grupos</h1>
        <p className="text-gray-500 mt-2">Gestiona tu grupo familiar o de amigos</p>
      </div>

      {/* Grupo actual */}
      {group && (
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-purple-50 to-purple-100 p-6 border border-purple-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-200 rounded-xl">
                <Home className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Grupo actual</p>
                <p className="text-xl font-bold text-gray-900">{group.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-xl px-4 py-2 border border-purple-200">
                <code className="text-purple-700 font-mono text-sm">{group.invite_code}</code>
              </div>
              <button
                onClick={copyToClipboard}
                className="p-2 rounded-xl bg-white border border-purple-200 hover:bg-purple-50 transition"
                title="Copiar código"
              >
                {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-purple-600" />}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Comparte este código con tus amigos para que se unan al grupo
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Crear grupo */}
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Crear grupo</h2>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Crea un nuevo grupo para organizar tus compras y gastos
          </p>
          <input
            type="text"
            placeholder="Nombre del grupo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 mb-4 focus:border-purple-400 focus:outline-none"
          />
          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear grupo'}
          </button>
        </div>

        {/* Unirse a grupo */}
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Unirse a grupo</h2>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Ingresa el código de invitación que te compartieron
          </p>
          <input
            type="text"
            placeholder="Código de invitación"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 mb-4 font-mono uppercase focus:border-purple-400 focus:outline-none"
          />
          <button
            onClick={handleJoin}
            disabled={loading || !inviteCode.trim()}
            className="w-full bg-white border-2 border-purple-600 text-purple-600 py-3 rounded-xl font-semibold hover:bg-purple-50 transition disabled:opacity-50"
          >
            {loading ? 'Uniéndose...' : 'Unirse al grupo'}
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Información adicional */}
      {!group && (
        <div className="mt-8 p-6 bg-gray-50 rounded-2xl text-center">
          <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">
            Aún no perteneces a ningún grupo.<br />
            Crea uno nuevo o únete con un código de invitación.
          </p>
        </div>
      )}
    </div>
  );
}