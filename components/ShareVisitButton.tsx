// components/ShareVisitButton.tsx
'use client';
import { Share2 } from 'lucide-react';

interface Props {
  visit: any;
  clienteNome: string;
}

export default function ShareVisitButton({ visit, clienteNome }: Props) {
  
  // Função auxiliar para tratar os formatos de lista do banco (igual ao da página principal)
  const formatarListaParaTexto = (texto: any) => {
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

  const handleShare = async () => {
    const dataFormatada = new Date(visit.created_at).toLocaleDateString('pt-BR');
    
    // 1. Cabeçalho Principal
    let texto = `💦 *RELATÓRIO DE VISITA - MHM PISCINAS* \n`;
    texto += `👤 *Cliente:* ${clienteNome}\n`;
    texto += `📅 *Data:* ${dataFormatada}\n`;
    texto += `───────────────────────\n\n`;

    // 2. Parâmetros Analisados
    texto += `📊 *Análise dos Parâmetros:* \n`;
    texto += `• pH: *${visit.ph || '-'}*\n`;
    texto += `• Cloro: *${visit.chlorine || '-'} ppm*\n`;
    texto += `• Alcalinidade: *${visit.alkalinity || '-'} ppm*\n`;
    texto += `• Estado da Água: *${visit.water_condition || 'Não informado'}*\n\n`;

    // 3. Checklist de Serviços (Se houver)
    const checklist = formatarListaParaTexto(visit.checklist);
    if (checklist.length > 0) {
      texto += `✅ *Serviços Executados:* \n`;
      checklist.forEach(item => {
        texto += `  ▫️ ${item}\n`;
      });
      texto += `\n`;
    }

    // 4. Produtos Aplicados (Se houver)
    const produtos = formatarListaParaTexto(visit.products_used);
    if (produtos.length > 0) {
      texto += `🧪 *Produtos Aplicados:* \n`;
      produtos.forEach(prod => {
        texto += `  ▫️ ${prod}\n`;
      });
      texto += `\n`;
    }

    // 5. Notas/Observações do Técnico (Se houver)
    if (visit.description && visit.description.trim().length > 0) {
      texto += `📝 *Observações do Técnico:* \n`;
      texto += `_"${visit.description.trim()}"_\n\n`;
    }

    // 6. Link da Foto na Nuvem (Se houver)
    if (visit.photo_url) {
      texto += `📸 *Foto da Piscina Tratada:* \n`;
      texto += `${visit.photo_url}\n\n`;
    }

    // 7. Rodapé com Link do App
    texto += `───────────────────────\n`;
    texto += `🏊‍♂️ Relatório enviado via _Piscineiro Mestre APP_`;

    // Dispara o compartilhamento nativo do smartphone
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Relatório da Piscina - ${clienteNome}`,
          text: texto,
        });
      } catch (err) {
        console.log('Compartilhamento cancelado.');
      }
    } else {
      // Fallback para computadores ou navegadores antigos abrindo o WhatsApp direto
      window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="bg-slate-900/40 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-slate-900/60 active:scale-95 transition-all border border-white/10 shadow-lg"
      aria-label="Compartilhar Relatório"
    >
      <Share2 className="w-5 h-5" />
    </button>
  );
}