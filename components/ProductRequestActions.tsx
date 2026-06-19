// components/ProductRequestActions.tsx
'use client';
import { useState } from 'react';

interface Props {
  solicitacaoId: string;
  produtoNome: string;
  onAction: (id: string, status: string, provider: string) => Promise<void>; // Avisa que ele vai receber uma função
}

export default function ProductRequestActions({ solicitacaoId, produtoNome, onAction }: Props) {
  const [resolvedStatus, setResolvedStatus] = useState<string | null>(null);
  const [resolvedProvider, setResolvedProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async (novoStatus: 'approved' | 'rejected', providedBy: 'empresa' | 'cliente') => {
    setLoading(true);
    
    try {
      // Aqui ele aciona a função poderosa que está lá no servidor!
      await onAction(solicitacaoId, novoStatus, providedBy);
      
      // Se passou sem dar erro no servidor, mostramos a tela de sucesso
      setResolvedStatus(novoStatus);
      setResolvedProvider(providedBy);
    } catch (error) {
      console.error('Erro na ação:', error);
      alert('Houve um erro de conexão. Tente novamente.');
    }
    
    setLoading(false);
  };

  if (resolvedStatus) {
    return (
      <div className="p-4 bg-slate-50 rounded-2xl text-center shadow-sm">
        <p className="text-slate-700 font-medium">
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