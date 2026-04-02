import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { TrendingUp, TrendingDown, FileDown } from 'lucide-react';

export default function MonthlyDetails() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await api.get('/purchases/history');
      setPurchases(res.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const monthKey = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}`;

  const byMonth = useMemo(() => {
    const map: Record<string, number> = {};
    purchases.forEach((p) => {
      const d = new Date(p.created_at);
      const key = monthKey(d.getFullYear(), d.getMonth() + 1);
      map[key] = (map[key] || 0) + (p.price || 0);
    });
    return map;
  }, [purchases]);

  const chartData = useMemo(
    () =>
      Object.keys(byMonth)
        .sort()
        .map((k) => ({ month: k, amount: byMonth[k] })),
    [byMonth]
  );

  const currentMonthData = useMemo(
    () =>
      purchases.filter((p) => {
        const d = new Date(p.created_at);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      }),
    [purchases, month, year]
  );

  const currentTotal = useMemo(
    () => currentMonthData.reduce((acc, p) => acc + (p.price || 0), 0),
    [currentMonthData]
  );

  const prevDate = new Date(year, month - 2, 1);
  const prevMonthTotal = byMonth[monthKey(prevDate.getFullYear(), prevDate.getMonth() + 1)] || 0;

  const lastYearTotal = byMonth[monthKey(year - 1, month)] || 0;

  const deltaPrev =
    prevMonthTotal > 0 ? ((currentTotal - prevMonthTotal) / prevMonthTotal) * 100 : 0;
  const deltaLastYear =
    lastYearTotal > 0 ? ((currentTotal - lastYearTotal) / lastYearTotal) * 100 : 0;

  const topCategories = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonthData.forEach((p) => {
      const cat = p.category_name || 'Sin categoría';
      map[cat] = (map[cat] || 0) + (p.price || 0);
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [currentMonthData]);

  const downloadFile = (content: string, filename: string, type: string, withBom = false) => {
    const bom = withBom ? '\uFEFF' : '';
    const blob = new Blob([bom + content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toCsvValue = (value: string | number) => {
    const v = String(value).replace(/"/g, '""');
    return `"${v}"`;
  };

  const formatDecimalComma = (value: number) =>
    value.toFixed(2).replace('.', ',');

  const exportCSV = () => {
    const rows = [
      ['Producto', 'Precio', 'Cantidad', 'Tienda', 'Fecha'],
      ...currentMonthData.map((p) => [
        p.product_name || '',
        formatDecimalComma(p.price || 0),
        p.quantity || 0,
        p.store_name || '',
        p.created_at || ''
      ])
    ];
    const csv = rows.map((r) => r.map(toCsvValue).join(';')).join('\n');
    downloadFile(csv, `detalle-mensual-${year}-${month}.csv`, 'text/csv;charset=utf-8', true);
  };

  const exportExcel = () => {
    const rows = currentMonthData
      .map(
        (p) =>
          `<tr><td>${p.product_name || ''}</td><td>${formatDecimalComma(
            p.price || 0
          )}</td><td>${p.quantity || 0}</td><td>${p.store_name || ''}</td><td>${
            p.created_at || ''
          }</td></tr>`
      )
      .join('');
    const html = `
      <html>
        <head><meta charset="UTF-8"></head>
        <body>
          <table>
            <tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Tienda</th><th>Fecha</th></tr>
            ${rows}
          </table>
        </body>
      </html>
    `;
    downloadFile(html, `detalle-mensual-${year}-${month}.xls`, 'application/vnd.ms-excel;charset=utf-8', true);
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Detalle mensual</h1>
          <p className="text-gray-500">Resumen del mes seleccionado</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          Volver al dashboard
        </button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl bg-white p-5 shadow-lg">
          <p className="text-sm text-gray-500">Total del mes</p>
          <p className="mt-2 text-2xl font-bold text-purple-600">{currentTotal.toFixed(2)}€</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-lg">
          <p className="text-sm text-gray-500">Mes anterior</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{prevMonthTotal.toFixed(2)}€</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-lg">
          <p className="text-sm text-gray-500">Mismo mes (año pasado)</p>
          <p className="mt-2 text-2xl font-bold text-indigo-600">{lastYearTotal.toFixed(2)}€</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-lg flex items-center gap-2">
          {deltaPrev >= 0 ? <TrendingUp className="h-5 w-5 text-green-500" /> : <TrendingDown className="h-5 w-5 text-red-500" />}
          <div>
            <p className="text-sm text-gray-500">Variación vs mes anterior</p>
            <p className={`text-xl font-bold ${deltaPrev >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {deltaPrev.toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-lg flex items-center gap-2">
          {deltaLastYear >= 0 ? <TrendingUp className="h-5 w-5 text-green-500" /> : <TrendingDown className="h-5 w-5 text-red-500" />}
          <div>
            <p className="text-sm text-gray-500">Variación vs año pasado</p>
            <p className={`text-xl font-bold ${deltaLastYear >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {deltaLastYear.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución mensual</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="amount" fill="#9333ea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selector (igual que Category) */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona mes</h3>
        <div className="flex gap-4">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded-xl border px-4 py-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-xl border px-4 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <option key={i} value={now.getFullYear() - i}>{now.getFullYear() - i}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Export */}
      <div className="rounded-2xl bg-white p-6 shadow-lg flex flex-wrap gap-4">
        <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
          <FileDown className="h-4 w-4" /> Exportar CSV
        </button>
        <button onClick={exportExcel} className="btn-secondary flex items-center gap-2">
          <FileDown className="h-4 w-4" /> Exportar Excel
        </button>
      </div>

      {/* Top categorías */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 categorías</h3>
        {topCategories.length === 0 ? (
          <p className="text-gray-500">No hay datos para este mes</p>
        ) : (
          <ul className="space-y-2">
            {topCategories.map(([cat, amount]) => (
              <li key={cat} className="flex justify-between border-b py-2 text-sm">
                <span>{cat}</span>
                <span className="font-semibold text-purple-600">{amount.toFixed(2)}€</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Listado */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compras del mes</h3>
        {currentMonthData.length === 0 ? (
          <p className="text-gray-500">No hay compras en este mes</p>
        ) : (
          <ul className="space-y-2">
            {currentMonthData.map((p, idx) => (
              <li key={idx} className="flex justify-between border-b py-2 text-sm">
                <span>{p.product_name}</span>
                <span className="font-semibold text-purple-600">{p.price?.toFixed(2)}€</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}