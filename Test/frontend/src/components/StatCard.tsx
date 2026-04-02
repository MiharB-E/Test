import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'purple' | 'blue' | 'green' | 'orange';
  onClick?: () => void;
}

const colorClasses = {
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    icon: 'text-purple-600',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    icon: 'text-green-600',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    icon: 'text-orange-600',
  },
};

export default function StatCard({ title, value, icon, trend, color = 'purple', onClick }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl bg-white p-6 text-left shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-purple-100 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative z-10">
        <div className={`inline-flex rounded-xl ${colors.bg} p-3`}>
          <div className={`h-6 w-6 ${colors.icon}`}>{icon}</div>
        </div>

        <h3 className="mt-4 text-sm font-medium text-gray-500">{title}</h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          {trend && (
            <span className={`flex items-center text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </div>
    </button>
  );
}