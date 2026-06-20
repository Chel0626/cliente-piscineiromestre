// components/ProductRequestActions.tsx
'use client';
import { useState } from 'react';

interface Props {
  solicitacaoId: string;
  produtoNome: string;
  onAction: (id: string, status: string, provider: string) => Promise<void>;
}

export default function ProductRequestActions({ solicitacaoId, produtoNome, onAction }: Props) {
  const [resolvedStatus, setResolvedStatus] = useState<string | null>(null);
  const [resolvedProvider, setResolvedProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async (novoStatus: 'approved' | 'rejected', providedBy: 'empresa' | 'cliente') => {
    setLoading(true);
    
    // 1. OTIMISMO: Mostramos a mensagem de sucesso na mesma hora que ele clica!
    setResolvedStatus(novoStatus);
    setResolvedProvider(providedBy);

    try {
      // 2. DELAY: Congelamos o código por 2.5 segundos. A mensagem fica paradinha na tela.
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // 3. AÇÃO: Agora sim acionamos o servidor (que vai salvar no banco e atualizar a tela)
      await onAction(solicitacaoId, novoStatus, providedBy);
      
    } catch (error) {
      // Se der erro de internet ou banco de dados, desfazemos o otimismo
      setResolvedStatus(null);
      setResolvedProvider(null);
      console.error('Erro na ação:', error);
      alert('Houve um erro de conexão. Tente novamente.');
    }
    
    setLoading(false);
  };

  if (resolvedStatus) {
    return (
      <div className="p-4 bg-slate-50 rounded-2xl text-center shadow-sm transition-all duration-500 animate-in fade-in">
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
        className="bg-blue-700 hover:bg-blue-800 text-white shadow-md shadow-blue-600/30 font-semibold py-3 px-4 rounded-xl transition-all"
      >
        Eu Providencio
      </button>
    </div>
  );
}