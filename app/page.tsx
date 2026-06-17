// app/page.tsx
import Image from 'next/image';
import WaterParamCard from '@/components/WaterParamCard';
import ProductRequestActions from '@/components/ProductRequestActions';
import { Droplet, FlaskConical, Gauge, StickyNote } from 'lucide-react'; // Sugestão de ícones

export default async function Dashboard() {
  // TODO: Fetch dados do Supabase server-side usando cookies()
  // Mock data para visualização inicial
  const visita = {
    data: '12/06/2026',
    foto_url: '/pool-clear.jpg', 
    ph: 7.4,
    cloro: 2.0,
    alcalinidade: 90,
    observacoes: 'Piscina escovada e decantada. Filtro retrolavado.',
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      {/* Header com Foto */}
      <div className="relative w-full h-64 rounded-b-3xl overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
        <Image 
          src={visita.foto_url} 
          alt="Piscina limpa" 
          fill 
          className="object-cover"
        />
        <div className="absolute bottom-4 left-4 z-20 text-white">
          <h1 className="text-2xl font-bold">Residência Silva</h1>
          <p className="text-sm opacity-90">Visita em {visita.data}</p>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6 max-w-lg mx-auto">
        {/* Parâmetros da Água */}
        <section className="flex gap-3 overflow-x-auto pb-2">
          <WaterParamCard 
            label="pH" 
            value={visita.ph} 
            unit="" 
            status="ideal" 
            icon={<Droplet />} 
          />
          <WaterParamCard 
            label="Cloro" 
            value={visita.cloro} 
            unit="ppm" 
            status="ideal" 
            icon={<FlaskConical />} 
          />
          <WaterParamCard 
            label="Alcalinidade" 
            value={visita.alcalinidade} 
            unit="ppm" 
            status="atencao" 
            icon={<Gauge />} 
          />
        </section>

        {/* Observações */}
        <section className="bg-amber-50 rounded-2xl p-4 shadow-sm border border-amber-100 flex gap-3">
          <StickyNote className="text-amber-600 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-amber-800 text-sm mb-1">Notas do Técnico</h3>
            <p className="text-slate-700 text-sm">{visita.observacoes}</p>
          </div>
        </section>

        {/* Solicitação de Produtos (Condicional) */}
        <section>
          {/* TODO: Lógica condicional - Exibir se status === 'pendente' */}
          <ProductRequestActions solicitacaoId="123" produtoNome="Cloro Estabilizado 10kg" />
        </section>
      </div>
    </main>
  );
}