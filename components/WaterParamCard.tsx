// components/WaterParamCard.tsx
'use client';
import { useState } from 'react';
import { Info } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  unit: string;
  status: string;
  icon: React.ReactNode;
}

export default function WaterParamCard({ label, value, unit, status, icon }: Props) {
  const [flipped, setFlipped] = useState(false);

  const getStatusClasses = () => {
    if (status === 'ideal') {
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        label: 'text-emerald-800',
        value: 'text-emerald-900',
        unit: 'text-emerald-700',
        icon: 'text-emerald-700',
      };
    }
    if (status === 'atencao') {
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        label: 'text-amber-800',
        value: 'text-amber-900',
        unit: 'text-amber-700',
        icon: 'text-amber-700',
      };
    }
    return {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      label: 'text-slate-600',
      value: 'text-slate-800',
      unit: 'text-slate-500',
      icon: 'text-slate-500',
    };
  };

  const colors = getStatusClasses();

  let idealText = '';
  if (label.toLowerCase().includes('ph')) idealText = 'Ideal: 7.2 a 7.6';
  else if (label.toLowerCase().includes('cloro')) idealText = 'Ideal: 1 a 3 ppm';
  else if (label.toLowerCase().includes('alcalinidade')) idealText = 'Ideal: 80 a 120 ppm';

  return (
    <div
      className="relative flex-1 h-[96px] cursor-pointer select-none group"
      onClick={() => setFlipped(!flipped)}
    >
      {/* FRENTE DA CARTA */}
      <div
        className={`absolute inset-0 ${colors.bg} border ${colors.border} rounded-xl p-3 flex flex-col justify-between transition-transform duration-500 ease-in-out`}
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div className="flex justify-between items-start">
          <span className={`text-sm font-medium ${colors.label}`}>{label}</span>
          <span className={`w-[18px] h-[18px] shrink-0 ${colors.icon}`}>{icon}</span>
        </div>
        
        <div className="flex items-baseline gap-1 mt-auto">
          <span className={`text-3xl font-bold tracking-tight ${colors.value}`}>{value || '-'}</span>
          {unit && <span className={`text-xs font-semibold ${colors.unit}`}>{unit}</span>}
        </div>

        {/* Ícone de informação mais nítido, encorpado e reposicionado */}
        <Info 
          strokeWidth={2.5} 
          className={`absolute bottom-2.5 right-2.5 w-[16px] h-[16px] opacity-75 ${colors.icon}`} 
        />
      </div>

      {/* VERSO DA CARTA */}
      <div
        className="absolute inset-0 bg-slate-800 rounded-xl p-2 border border-slate-700 flex flex-col justify-center items-center text-center transition-transform duration-500 ease-in-out shadow-sm"
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: flipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
        }}
      >
        <span className="text-slate-300 text-[11px] uppercase tracking-wider font-semibold mb-1 truncate w-full">{label}</span>
        <span className="text-emerald-400 text-xs font-bold bg-slate-900/50 px-2 py-1 rounded-md border border-slate-700/50 w-full">
          {idealText}
        </span>
      </div>
    </div>
  );
}
