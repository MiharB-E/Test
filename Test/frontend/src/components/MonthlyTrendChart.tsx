import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlyTrend } from '../services/dashboard';
import { useNavigate } from 'react-router-dom';

interface MonthlyTrendChartProps {
  data: MonthlyTrend[];
}

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/analytics/monthly')}
      className="rounded-2xl bg-white p-6 shadow-lg cursor-pointer transition hover:shadow-xl"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución mensual</h3>
      <div className="h-80">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No hay datos todavía
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="amount" fill="#9333ea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}