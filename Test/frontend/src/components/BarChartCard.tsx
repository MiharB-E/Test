import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "Arroz", value: 24 },
  { name: "Leche", value: 20 },
  { name: "Huevos", value: 16 },
  { name: "Pasta", value: 14 },
  { name: "Café", value: 12 },
];

export default function BarChartCard() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-card">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">Top 5 productos</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6E6FA" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#9A99DD" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}