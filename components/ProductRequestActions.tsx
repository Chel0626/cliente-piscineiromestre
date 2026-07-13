'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Receipt, Copy } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Props {
  solicitacaoId: string;
  produtoNome: string;
  statusAtual?: string;
  onAction: (id: string, status: string, provider: string) => Promise<void>;
}

export default function ProductRequestActions({ solicitacaoId, produtoNome, statusAtual, onAction }: Props) {
  const [fase, setFase] = useState<string | null>(() => {
    if (statusAtual === 'approved') return 'pix_pendente';
    return statusAtual || null;
  });
  
  const [loading, setLoading] = useState(false);
  const [precos, setPrecos] = useState<any[]>([]);
  const [valorTotal, setValorTotal] = useState<number>(0);

  const produtosLista = produtoNome
    .split(/,|\be\b|•/) 
    .map(p => p.trim())
    .filter(p => p.length > 0);

  useEffect(() => {
    async function fetchPrecos() {
      console.log("=== INICIANDO BUSCA DE PREÇOS ===");
      console.log("1. SolicitacaoId Recebido:", solicitacaoId);
      console.log("2. Texto Bruto de Produtos:", produtoNome);

      if (!solicitacaoId) {
        console.log("❌ Parando: Sem solicitacaoId");
        return;
      }
      
      try {
        const itensExtraidos = produtosLista.map(p => {
          const match = p.match(/(.*?)(?:\s*\((\d+)\))?$/);
          return {
            nomeOriginal: p,
            nomeLimpo: match ? match[1].trim() : p,
            quantidade: match && match[2] ? parseInt(match[2], 10) : 1
          };
        });
        console.log("3. Itens Extraídos pelo Regex:", itensExtraidos);

        console.log("4. Consultando tabela product_requests no Supabase...");
        const { data: request, error: reqError } = await supabase
          .from('product_requests')
          .select('tenant_id')
          .or(`id.eq.${solicitacaoId},visit_id.eq.${solicitacaoId}`)
          .maybeSingle();

        console.log("5. Retorno product_requests:", { request, error: reqError });

        if (reqError) {
          console.error("❌ Erro na busca ao banco:", reqError);
          return;
        }

        if (!request?.tenant_id) {
          console.warn("⚠️ ALERTA: Pedido não encontrado ou bloqueado por RLS (permissão).");
          return;
        }

        const nomesParaBuscar = itensExtraidos.map(i => i.nomeLimpo);
        console.log("6. Consultando tabela products para os nomes:", nomesParaBuscar);

        const { data: catalogo, error: catError } = await supabase
          .from('products')
          .select('name, price')
          .eq('tenant_id', request.tenant_id)
          .in('name', nomesParaBuscar);

        console.log("7. Retorno products (Catálogo Encontrado):", { catalogo, error: catError });

        if (catError) {
          console.error("❌ Erro ao buscar a tabela de preços:", catError);
          return;
        }

        let totalCalculado = 0;
        const itensComPreco = itensExtraidos.map(item => {
          const produtoCatalogo = catalogo?.find((c: any) => c.name === item.nomeLimpo);
          const precoUnidade = produtoCatalogo ? Number(produtoCatalogo.price) : 0;
          const subtotal = precoUnidade * item.quantidade;
          
          totalCalculado += subtotal;

          return {
            nome: item.nomeLimpo,
            quantidade: item.quantidade,
            precoUnidade,
            subtotal
          };
        });

        console.log("8. Cruzamento Final (Itens calculados):", itensComPreco);
        console.log("9. Total Calculado:", totalCalculado);

        if (totalCalculado > 0) {
          console.log("✅ Atualizando a Tela com os Valores!");
          setPrecos(itensComPreco);
          setValorTotal(totalCalculado);
        } else {
          console.log("⚠️ A tela não foi atualizada porque o total deu R$ 0,00 (preços não cadastrados).");
        }

      } catch (error) {
        console.error("❌ Erro Crítico no try/catch:", error);
      }
    }

    fetchPrecos();
  }, [solicitacaoId, produtoNome]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAction = async (novoStatus: string, providedBy: 'empresa' | 'cliente') => {
    setLoading(true);
    try {
      if (novoStatus !== 'comprando') {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      await onAction(solicitacaoId, novoStatus, providedBy);

      if (novoStatus === 'comprando') {
        setFase('comprando');
      } else if (providedBy === 'empresa') {
        setFase('pix_pendente');
      } else {
        setFase('concluido');
      }
    } catch (error) {
      console.error('Erro na ação:', error);
      alert('Houve um erro de conexão. Tente novamente.');
    }
    setLoading(false);
  };

  const copiarPix = () => {
    navigator.clipboard.writeText('35354549000169');
    alert('Chave CNPJ copiada!');
  };

  // ------------------------------------------------------------------
  // TELA 4: SOLICITAÇÃO CONCLUÍDA / ENCERRADA
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
  // TELA 3: PIX PENDENTE (O CARD LARANJA PERSISTENTE)
  // ------------------------------------------------------------------
  if (fase === 'pix_pendente') {
    return (
      <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-5 shadow-sm mb-4 transition-all duration-500 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="w-6 h-6 text-orange-600 shrink-0" />
          <h3 className="font-bold text-orange-900 text-lg">Pagamento Pendente</h3>
        </div>

        <p className="text-sm text-orange-800 mb-4 font-medium leading-relaxed">
          Ótima escolha! Para confirmar a entrega dos produtos na próxima visita, realize o Pix e <strong>envie o comprovante pelo WhatsApp</strong>.
        </p>

        <div className="bg-white/70 rounded-xl p-4 mb-4">
          {precos.length > 0 ? (
            <ul className="space-y-2 mb-3 border-b border-orange-200/60 pb-3">
              {precos.map((item, idx) => (
                <li key={idx} className="flex justify-between text-sm text-orange-900">
                  <span>{item.quantidade}x {item.nome}</span>
                  <span className="font-semibold">{formatCurrency(item.subtotal)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex justify-between items-center font-black text-orange-950 text-lg">
            <span>Total a pagar:</span>
            <span>{formatCurrency(valorTotal)}</span>
          </div>
        </div>

        <div className="bg-orange-600 text-white rounded-xl p-4 text-center relative overflow-hidden group">
          <p className="text-xs uppercase tracking-widest font-semibold opacity-90 mb-1">Chave Pix (CNPJ)</p>
          <p className="font-mono text-2xl font-bold tracking-tight mb-3">35.354.549/0001-69</p>
          
          <button 
            onClick={copiarPix}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copiar Chave
          </button>
        </div>
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
        <p className="text-sm text-slate-600 mb-3">Sua lista de compras pendente:</p>
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
      
      <ul className="space-y-2 mb-4">
        {precos.length > 0 ? (
          precos.map((item, index) => (
            <li key={index} className="flex justify-between items-center text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                <span>{item.quantidade}x {item.nome}</span>
              </div>
              <span className="font-semibold text-slate-700">{formatCurrency(item.subtotal)}</span>
            </li>
          ))
        ) : (
          produtosLista.map((prod, index) => (
            <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
              <span>{prod}</span>
            </li>
          ))
        )}
      </ul>

      {precos.length > 0 && valorTotal > 0 && (
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl mb-5 border border-slate-100">
          <span className="font-bold text-slate-700">Total:</span>
          <span className="font-bold text-lg text-blue-700">{formatCurrency(valorTotal)}</span>
        </div>
      )}

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