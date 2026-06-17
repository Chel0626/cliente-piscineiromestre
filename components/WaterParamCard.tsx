// components/WaterParamCard.tsx
import React from 'react';

interface WaterParamCardProps {
  label: string;
  value: string | number;
  unit: string;
  status: 'ideal' | 'atencao' | 'critico';
  icon: React.ReactNode;
}

export default function WaterParamCard({ label, value, unit, status, icon }: WaterParamCardProps) {
  const statusConfig = {
    ideal: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    atencao: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    critico: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };

  const config = statusConfig[status];

  return (
    <div className={`flex flex-col p-4 rounded-2xl shadow-sm border ${config.bg} ${config.border} flex-1`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${config.text}`}>{label}</span>
        <div className={`w-6 h-6 ${config.text}`}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${config.text}`}>{value}</span>
        <span className={`text-xs ${config.text} opacity-80`}>{unit}</span>
      </div>
    </div>
  );
}