// components/ProductRequestActions.tsx
'use client';
import { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  solicitacaoId: string;
  produtoNome: string;
  statusAtual?: string;
  onAction: (id: string, status: string, provider: string) => Promise<void>;
}

export default function ProductRequestActions({ solicitacaoId, produtoNome, statusAtual, onAction }: Props) {
  const [fase, setFase] = useState<string | null>(statusAtual || null);
  const [loading, setLoading] = useState(false);

  // Mágica atualizada para reconhecer a bolinha ( • ) como separador de lista!
  const produtosLista = produtoNome
    .split(/,|\be\b|•/) 
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const handleAction = async (novoStatus: string, providedBy: 'empresa' | 'cliente') => {
    setLoading(true);
    
    if (novoStatus === 'comprando') {
      setFase('comprando');
    } else {
      setFase('concluido');
    }

    try {
      if (novoStatus !== 'comprando') {
        await new Promise(resolve => setTimeout(resolve, 2500));
      }
      await onAction(solicitacaoId, novoStatus, providedBy);
    } catch (error) {
      setFase(statusAtual || null);
      console.error('Erro na ação:', error);
      alert('Houve um erro de conexão. Tente novamente.');
    }
    
    setLoading(false);
  };

  // ------------------------------------------------------------------
  // TELA 3: TUDO RESOLVIDO
  // ------------------------------------------------------------------
  if (fase === 'concluido') {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4 transition-all duration-500 animate-in fade-in">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-bold text-slate-800">Solicitação de Produtos</h3>
        </div>
        <p className="text-emerald-600 font-medium flex items-center gap-2 text-sm bg-emerald-50 p-3 rounded-xl border border-emerald-100">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Solicitação encerrada com sucesso!
        </p>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // TELA 2: LISTA DE COMPRAS DO CLIENTE
  // ------------------------------------------------------------------
  if (fase === 'comprando') {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4 animate-in fade-in slide-in-from-bottom-2">
        <h3 className="font-bold text-slate-800 mb-4">Solicitação de Produtos</h3>
        
        <p className="text-sm text-slate-600 mb-3">
          Sua lista de compras pendente:
        </p>
        
        {/* Lista visualmente idêntica à de Produtos Aplicados */}
        <ul className="space-y-2 mb-5">
          {produtosLista.map((prod, index) => (
            <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
              <span>{prod}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => handleAction('approved', 'cliente')}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
        >
          Já comprei! Encerrar Pedido
        </button>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // TELA 1: DECISÃO INICIAL
  // ------------------------------------------------------------------
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
        <h3 className="font-bold text-slate-800">Solicitação de Produtos</h3>
      </div>

      <p className="text-sm text-slate-600 mb-3">
        Sua piscina está precisando de reposição:
      </p>
      
      {/* Lista visualmente idêntica à de Produtos Aplicados */}
      <ul className="space-y-2 mb-5">
        {produtosLista.map((prod, index) => (
          <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
            <span>{prod}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => handleAction('approved', 'empresa')}
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold text-slate-900 bg-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all active:scale-95 disabled:opacity-50"
        >
          Solicitar ao Piscineiro!
        </button>
        <button
          onClick={() => handleAction('comprando', 'cliente')}
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 text-white shadow-md shadow-blue-600/30 font-semibold py-3.5 px-4 rounded-xl transition-all"
        >
          Eu Providencio
        </button>
      </div>
    </div>
  );
}