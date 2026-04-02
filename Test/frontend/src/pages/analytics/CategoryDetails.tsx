import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../../services/api';
import { FileDown, TrendingUp, TrendingDown } from 'lucide-react';

export default function CategoryDetails() {
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

  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      const d = new Date(p.created_at);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  }, [purchases, month, year]);

  const data = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((p) => {
      const cat = p.category_name || 'Sin categoría';
      map[cat] = (map[cat] || 0) + (p.price || 0);
    });
    return Object.keys(map).map((cat) => ({
      category: cat,
      amount: map[cat],
      color: '#9333ea'
    }));
  }, [filtered]);

  const total = data.reduce((acc, c) => acc + c.amount, 0);
  const top = data.slice().sort((a, b) => b.amount - a.amount)[0];

  const prevDate = new Date(year, month - 2, 1);
  const prevFiltered = purchases.filter((p) => {
    const d = new Date(p.created_at);
    return d.getMonth() + 1 === prevDate.getMonth() + 1 && d.getFullYear() === prevDate.getFullYear();
  });
  const prevTotal = prevFiltered.reduce((acc, p) => acc + (p.price || 0), 0);

  const lastYearFiltered = purchases.filter((p) => {
    const d = new Date(p.created_at);
    return d.getMonth() + 1 === month && d.getFullYear() === year - 1;
  });
  const lastYearTotal = lastYearFiltered.reduce((acc, p) => acc + (p.price || 0), 0);

  const deltaPrev = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;
  const deltaLastYear = lastYearTotal > 0 ? ((total - lastYearTotal) / lastYearTotal) * 100 : 0;

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
    const rows = [['Categoría', 'Total'], ...data.map((c) => [c.category, formatDecimalComma(c.amount)])];
    const csv = rows.map((r) => r.map(toCsvValue).join(';')).join('\n');
    downloadFile(csv, `categorias-${year}-${month}.csv`, 'text/csv;charset=utf-8', true);
  };

  const exportExcel = () => {
    const rows = data
      .map((c) => `<tr><td>${c.category}</td><td>${formatDecimalComma(c.amount)}</td></tr>`)
      .join('');
    const html = `
      <html>
        <head><meta charset="UTF-8"></head>
        <body>
          <table>
            <tr><th>Categoría</th><th>Total</th></tr>
            ${rows}
          </table>
        </body>
      </html>
    `;
    downloadFile(html, `categorias-${year}-${month}.xls`, 'application/vnd.ms-excel;charset=utf-8', true);
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Detalle por categoría</h1>
          <p className="text-gray-500">Gasto detallado del mes</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          Volver al dashboard
        </button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl bg-white p-5 shadow-lg">
          <p className="text-sm text-gray-500">Total del mes</p>
          <p className="mt-2 text-2xl font-bold text-purple-600">{total.toFixed(2)}€</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-lg">
          <p className="text-sm text-gray-500">Categorías</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{data.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-lg">
          <p className="text-sm text-gray-500">Top categoría</p>
          <p className="mt-2 text-xl font-bold text-indigo-600">{top?.category || '-'}</p>
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

      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos por categoría</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#9333ea'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-lg flex gap-4">
        <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
          <FileDown className="h-4 w-4" /> Exportar CSV
        </button>
        <button onClick={exportExcel} className="btn-secondary flex items-center gap-2">
          <FileDown className="h-4 w-4" /> Exportar Excel
        </button>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle</h3>
        {data.length === 0 ? (
          <p className="text-gray-500">No hay datos para este mes</p>
        ) : (
          <ul className="space-y-2">
            {data.map((c, idx) => (
              <li key={idx} className="flex justify-between border-b py-2 text-sm">
                <span>{c.category}</span>
                <span className="font-semibold text-purple-600">{c.amount.toFixed(2)}€</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}