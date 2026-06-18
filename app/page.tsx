// app/page.tsx
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabaseServer';
import WaterParamCard from '@/components/WaterParamCard';
import ProductRequestActions from '@/components/ProductRequestActions';
import { Droplet, FlaskConical, Gauge, StickyNote, CheckCircle2, Waves } from 'lucide-react';

export default async function Dashboard() {
  // 1. Chama o nosso porteiro (Supabase configurado para o servidor)
  const supabase = await createClient();

  // 2. Pergunta ao Supabase: "Tem alguém logado aí?"
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // 3. Se não tiver ninguém (ou der erro), expulsa para a tela de login
  if (authError || !user) {
    redirect('/login');
  }

  // 4. Descobre quem é o cliente usando o ID do usuário logado
  const { data: cliente } = await supabase
    .from('clients')
    .select('id, name')
    .eq('auth_user_id', user.id)
    .single();

  if (!cliente) {
    return <div className="p-10 text-center">Erro: Seu cadastro de cliente não foi encontrado.</div>;
  }

  // 5. Busca a última visita APENAS desse cliente
  const { data: visit } = await supabase
    .from('visits')
    .select('*')
    .eq('client_id', cliente.id)
    .order('created_at', { ascending: false }) // Pega a mais recente
    .limit(1)
    .single(); // Garante que retorne só 1 objeto, não uma lista

  // 6. Se não tiver visita nenhuma ainda, mostra uma tela amigável
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

  // 7. Renderiza a tela normal com os dados reais
  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <div className="relative w-full h-64 rounded-b-3xl overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent z-10" />
        
        {visit.photo_url ? (
          <Image src={visit.photo_url} alt="Piscina" fill className="object-cover" />
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
      </div>

      <div className="px-4 mt-6 space-y-6 max-w-lg mx-auto">
        <section className="flex gap-3 overflow-x-auto pb-2">
          <WaterParamCard label="pH" value={visit.ph} unit="" status="ideal" icon={<Droplet />} />
          <WaterParamCard label="Cloro" value={visit.chlorine} unit="ppm" status="ideal" icon={<FlaskConical />} />
          <WaterParamCard label="Alcalinidade" value={visit.alkalinity} unit="ppm" status="atencao" icon={<Gauge />} />
        </section>

        {visit.checklist && visit.checklist.length > 0 && (
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500 w-5 h-5" /> Checklist Concluído
            </h3>
            <ul className="space-y-2">
              {visit.checklist.map((item: string, index: number) => (
                <li key={index} className="text-sm text-slate-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {visit.products_used && visit.products_used.length > 0 && (
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Produtos Aplicados</h3>
            <div className="flex flex-wrap gap-2">
              {visit.products_used.map((produto: string, index: number) => (
                <span key={index} className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-lg text-xs font-medium border border-cyan-100">
                  {produto}
                </span>
              ))}
            </div>
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
      </div>
    </main>
  );
}