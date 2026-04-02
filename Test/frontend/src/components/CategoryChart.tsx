import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategorySpending } from '../services/dashboard';
import { useNavigate } from 'react-router-dom';

interface CategoryChartProps {
  data: CategorySpending[];
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/analytics/categories')}
      className="rounded-2xl bg-white p-6 shadow-lg cursor-pointer transition hover:shadow-xl"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos por categoría</h3>
      <div className="h-80">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No hay datos todavía
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}