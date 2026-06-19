// app/page.tsx
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabaseServer';
import WaterParamCard from '@/components/WaterParamCard';
import ProductRequestActions from '@/components/ProductRequestActions';
import InstallPrompt from '@/components/InstallPrompt';
import NotificationPrompt from '@/components/NotificationPrompt';
import { Droplet, FlaskConical, Gauge, StickyNote, CheckCircle2, Waves } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: cliente } = await supabase
    .from('clients')
    .select('id, name')
    .eq('auth_user_id', user.id)
    .single();

  if (!cliente) {
    return <div className="p-10 text-center">Erro: Seu cadastro de cliente não foi encontrado.</div>;
  }

  async function aprovarPedidoNoServidor(solicitacaoId: string, status: string, providedBy: string) {
    'use server';
    const supabaseServer = await createClient();
    const payload: any = { status: status, approval_date: new Date().toISOString() };
    if (providedBy) payload.provided_by = providedBy;

    const { error } = await supabaseServer.from('product_requests').update(payload).eq('id', solicitacaoId);
    if (error) throw new Error('Falha ao atualizar o banco');
    revalidatePath('/'); 
  }

  // --- SERVER ACTION BLINDADA CONTRA ERROS SILENCIOSOS ---
  async function registarPushNoServidor(subscription: any) {
    'use server';
    const supabaseServer = await createClient();

    const { data: { user } } = await supabaseServer.auth.getUser();
    const { data: cli } = await supabaseServer.from('clients').select('id').eq('auth_user_id', user?.id).single();

    if (!cli) {
      throw new Error('Cliente não identificado no servidor.');
    }

    // Executa a inserção checando o objeto de erro explicitamente
    const { error: insertError } = await supabaseServer
      .from('client_push_subscriptions')
      .insert({
        client_id: cli.id,
        subscription: subscription
      });

    if (insertError) {
      console.error('ERRO REAL DO SUPABASE NO PUSH:', insertError.message);
      throw new Error(insertError.message); // Garante que o componente pegue o erro no catch
    }
  }

  // 1. Busca a última visita
  const { data: visit } = await supabase
    .from('visits')
    .select('*')
    .eq('client_id', cliente.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!visit) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Waves className="w-16 h-16 text-cyan-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700">Bem-vindo, {cliente.name}!</h2>
          <p className="text-slate-500 mt-2">Sua piscina ainda não recebeu a primeira visita registrada.</p>
        </div>
      </main>
    );
  }

  // 2. Busca o pedido estruturado pendente
  const { data: pendingRequest } = await supabase
    .from('product_requests')
    .select('id, products')
    .eq('client_id', cliente.id) 
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let nomesProdutosPendentes = '';
  if (pendingRequest && Array.isArray(pendingRequest.products)) {
    nomesProdutosPendentes = pendingRequest.products
      .map((p: any) => `${p.name} (${p.quantity || 1})`)
      .join(' • ');
  }

  const formatarLista = (texto: any) => {
    if (!texto) return [];
    let textoReal = Array.isArray(texto) && texto.length === 1 && typeof texto[0] === 'string' ? texto[0] : texto;
    if (Array.isArray(textoReal)) return textoReal;
    if (typeof textoReal === 'string') {
      let limpo = textoReal.trim();
      if (limpo.startsWith('{') && limpo.endsWith('}')) {
        return limpo.slice(1, -1).split('","').map(item => item.replace(/^"|"$/g, '').trim()).filter(item => item.length > 0);
      }
      if (limpo.includes('•')) {
        return limpo.split('•').map(item => item.trim()).filter(item => item.length > 0);
      }
      return [limpo];
    }
    return [];
  };

  const checklistTratado = formatarLista(visit.checklist);
  const produtosTratados = formatarLista(visit.products_used);

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      {/* CARD DA FOTO: Agora ele é o container pai do prompt de notificação */}
      <div className="relative w-full h-64 rounded-b-3xl overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent z-10" />
        
        {visit.photo_url ? (
          <Image src={visit.photo_url} alt="Piscina" fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full bg-cyan-800 flex items-center justify-center">
            <Waves className="text-white w-16 h-16 opacity-50" />
          </div>
        )}

        <div className="absolute bottom-4 left-4 z-20 text-white w-full pr-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold">Última Visita</h1>
            <p className="text-sm opacity-90">{new Date(visit.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="bg-cyan-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-cyan-300/50">
            {visit.water_condition || 'Não informada'}
          </div>
        </div>

        {/* POPUP DE NOTIFICAÇÃO ADICIONADO AQUI DENTRO (VAI FAZER O OVERLAY DA FOTO) */}
        <NotificationPrompt 
          clientId={cliente.id} 
          onSaveSubscription={registarPushNoServidor} 
        />
      </div>

      <div className="px-4 mt-6 space-y-6 max-w-lg mx-auto">
        <section className="flex gap-3 overflow-x-auto pb-2">
          <WaterParamCard label="pH" value={visit.ph} unit="" status="ideal" icon={<Droplet />} />
          <WaterParamCard label="Cloro" value={visit.chlorine} unit="ppm" status="ideal" icon={<FlaskConical />} />
          <WaterParamCard label="Alcalinidade" value={visit.alkalinity} unit="ppm" status="atencao" icon={<Gauge />} />
        </section>

        {checklistTratado.length > 0 && (
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500 w-5 h-5" /> Checklist Concluído
            </h3>
            <ul className="space-y-2">
              {checklistTratado.map((item: string, index: number) => (
                <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {produtosTratados.length > 0 && (
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Produtos Aplicados</h3>
            <ul className="space-y-2">
              {produtosTratados.map((produto: string, index: number) => (
                <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 shrink-0" />
                  <span>{produto}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {visit.description && (
          <section className="bg-amber-50 rounded-2xl p-4 shadow-sm border border-amber-100 flex gap-3">
            <StickyNote className="text-amber-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-amber-800 text-sm mb-1">Notas do Técnico</h3>
              <p className="text-slate-700 text-sm">{visit.description}</p>
            </div>
          </section>
        )}

        {pendingRequest && (
          <section className="pt-2">
            <ProductRequestActions 
              produtoNome={nomesProdutosPendentes} 
              solicitacaoId={pendingRequest.id} 
              onAction={aprovarPedidoNoServidor}
            />
          </section>
        )}

        <InstallPrompt />
      </div>
    </main>
  );
}