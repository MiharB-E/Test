import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { name: "Despensa", value: 420 },
  { name: "Bebidas", value: 210 },
  { name: "Limpieza", value: 140 },
];

const COLORS = ["#9A99DD", "#B6B6E8", "#E6E6FA"];

export default function PieChartCard() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-card">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">Gastos por categoría</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}