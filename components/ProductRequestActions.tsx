// components/ProductRequestActions.tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Props {
  solicitacaoId: string;
  produtoNome: string;
}

export default function ProductRequestActions({ solicitacaoId, produtoNome }: Props) {
  const [resolvedStatus, setResolvedStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async (novoStatus: 'solicitado_piscineiro' | 'cliente_providencia') => {
    setLoading(true);
    // TODO: ajustar nome da tabela 'solicitacoes_produtos' caso necessário
    const { error } = await supabase
      .from('solicitacoes_produtos')
      .update({ status: novoStatus })
      .eq('id', solicitacaoId);

    if (!error) {
      setResolvedStatus(novoStatus);
    }
    setLoading(false);
  };

  if (resolvedStatus) {
    return (
      <div className="p-4 bg-slate-50 rounded-2xl text-center shadow-sm">
        <p className="text-slate-700 font-medium">
          {resolvedStatus === 'solicitado_piscineiro' 
            ? '✅ Obrigado! Já avisamos o Piscineiro.' 
            : '✅ Combinado, você vai providenciar.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <p className="text-sm text-slate-600 mb-2">
        Foi identificado que sua piscina precisa de <strong>{produtoNome}</strong>. O que você prefere?
      </p>
      <button
        onClick={() => handleAction('solicitado_piscineiro')}
        disabled={loading}
        className="w-full py-4 rounded-2xl font-bold text-slate-900 bg-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all active:scale-95"
      >
        Solicitar ao Piscineiro
      </button>
      <button
        onClick={() => handleAction('cliente_providencia')}
        disabled={loading}
        className="w-full py-4 rounded-2xl font-bold text-white bg-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all active:scale-95"
      >
        Eu Providencio
      </button>
    </div>
  );
}