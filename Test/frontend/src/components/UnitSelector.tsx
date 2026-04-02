import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface UnitSelectorProps {
  unit: string;
  unitType: 'unit' | 'weight' | 'volume';
  quantity: number;
  onChange: (quantity: number) => void;
}

const unitLabels = {
  unit: { default: 'unidades', options: ['unidades', 'piezas'] },
  weight: { default: 'kg', options: ['kg', 'g', 'lb'] },
  volume: { default: 'litros', options: ['litros', 'ml', 'gal'] },
};

export default function UnitSelector({ unit, unitType, quantity, onChange }: UnitSelectorProps) {
  const [inputValue, setInputValue] = useState(quantity.toString());

  const handleChange = (value: string) => {
    setInputValue(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      onChange(num);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <input
          type="number"
          step="0.01"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 focus:border-purple-400 focus:outline-none"
          placeholder="Cantidad"
        />
      </div>
      <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700">
        {unit}
      </div>
    </div>
  );
}