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
  const [resolvedProvider, setResolvedProvider] = useState<string | null>(null); // <-- Estado novo aqui!
  const [loading, setLoading] = useState(false);

  const handleAction = async (novoStatus: 'approved' | 'rejected', providedBy?: 'empresa' | 'cliente') => {
    setLoading(true);
    
    const updateData: any = { 
        status: novoStatus 
    };

    if (novoStatus === 'approved') {
        updateData.approval_date = new Date().toISOString();
        if (providedBy) {
            updateData.provided_by = providedBy;
        }
    }

    const { error } = await supabase
      .from('product_requests')
      .update(updateData)
      .eq('id', solicitacaoId); 

    if (error) {
      console.error('Erro ao atualizar status:', error.message);
      alert('Houve um erro ao registrar sua resposta.');
    } else {
      setResolvedStatus(novoStatus);
      if (providedBy) setResolvedProvider(providedBy); // <-- Salva quem vai providenciar
    }
    
    setLoading(false);
  };

  if (resolvedStatus) {
    return (
      <div className="p-4 bg-slate-50 rounded-2xl text-center shadow-sm">
        <p className="text-slate-700 font-medium">
          {/* Agora ele verifica quem vai fornecer para dar a mensagem certa! */}
          {resolvedStatus === 'approved' && resolvedProvider === 'empresa'
            ? '✅ Obrigado! Já avisamos o Piscineiro para levar.' 
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
        onClick={() => handleAction('approved', 'empresa')}
        disabled={loading}
        className="w-full py-4 rounded-2xl font-bold text-slate-900 bg-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all active:scale-95 disabled:opacity-50"
      >
        Solicitar ao Piscineiro
      </button>
      <button
        onClick={() => handleAction('approved', 'cliente')}
        disabled={loading}
        className="w-full py-4 rounded-2xl font-bold text-white bg-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all active:scale-95 disabled:opacity-50"
      >
        Eu Providencio
      </button>
    </div>
  );
}