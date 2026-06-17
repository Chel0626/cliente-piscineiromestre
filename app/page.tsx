// app/page.tsx
import Image from 'next/image';
import WaterParamCard from '@/components/WaterParamCard';
import ProductRequestActions from '@/components/ProductRequestActions';
import { Droplet, FlaskConical, Gauge, StickyNote, CheckCircle2, Waves } from 'lucide-react';

export default async function Dashboard() {
  // Mock atualizado com os nomes exatos do seu Supabase (tabela visits)
  const visit = {
    client_id: '123e4567-e89b-12d3-a456-426614174000',
    created_at: '17/06/2026', // Data formatada para visualização
    photo_url: '/pool-clear.jpg', // Coloque uma imagem de teste na pasta public/
    water_condition: 'Cristalina',
    ph: 7.4,
    chlorine: 2.0,
    alkalinity: 90,
    description: 'Piscina escovada e decantada. Filtro retrolavado.',
    products_used: ['Cloro Estabilizado', 'Algicida de Manutenção', 'Clarificante'],
    checklist: ['Limpeza de bordas', 'Aspiração do fundo', 'Limpeza do skimmer'],
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      {/* Header com Foto e Condição da Água */}
      <div className="relative w-full h-64 rounded-b-3xl overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent z-10" />
        
        {/* Fallback caso não tenha foto */}
        {visit.photo_url ? (
          <Image 
            src={visit.photo_url} 
            alt="Piscina" 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-cyan-800 flex items-center justify-center">
            <Waves className="text-white w-16 h-16 opacity-50" />
          </div>
        )}

        <div className="absolute bottom-4 left-4 z-20 text-white w-full pr-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold">Última Visita</h1>
            <p className="text-sm opacity-90">{visit.created_at}</p>
          </div>
          <div className="bg-cyan-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-cyan-300/50">
            {visit.water_condition}
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6 max-w-lg mx-auto">
        {/* Parâmetros da Água */}
        <section className="flex gap-3 overflow-x-auto pb-2">
          <WaterParamCard 
            label="pH" 
            value={visit.ph} 
            unit="" 
            status="ideal" 
            icon={<Droplet />} 
          />
          <WaterParamCard 
            label="Cloro" 
            value={visit.chlorine} 
            unit="ppm" 
            status="ideal" 
            icon={<FlaskConical />} 
          />
          <WaterParamCard 
            label="Alcalinidade" 
            value={visit.alkalinity} 
            unit="ppm" 
            status="atencao" 
            icon={<Gauge />} 
          />
        </section>

        {/* Checklist Realizado */}
        {visit.checklist && visit.checklist.length > 0 && (
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500 w-5 h-5" />
              Checklist Concluído
            </h3>
            <ul className="space-y-2">
              {visit.checklist.map((item, index) => (
                <li key={index} className="text-sm text-slate-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Produtos Usados */}
        {visit.products_used && visit.products_used.length > 0 && (
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Produtos Aplicados</h3>
            <div className="flex flex-wrap gap-2">
              {visit.products_used.map((produto, index) => (
                <span key={index} className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-lg text-xs font-medium border border-cyan-100">
                  {produto}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Observações do Técnico */}
        {visit.description && (
          <section className="bg-amber-50 rounded-2xl p-4 shadow-sm border border-amber-100 flex gap-3">
            <StickyNote className="text-amber-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-amber-800 text-sm mb-1">Notas do Técnico</h3>
              <p className="text-slate-700 text-sm">{visit.description}</p>
            </div>
          </section>
        )}

        {/* Solicitação de Produtos (Exemplo de componente que você já criou) */}
        <section>
          <ProductRequestActions solicitacaoId="123" produtoNome="Cloro Estabilizado 10kg" />
        </section>
      </div>
    </main>
  );
}