// supabase/functions/notificar-cliente/index.ts
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

// Configuração padrão de CORS (para permitir que qualquer app chame essa função)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Lida com a requisição de "pre-flight" do navegador
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { clientId, titulo, mensagem, url } = await req.json();

    if (!clientId) {
      throw new Error('Client ID é obrigatório');
    }

    // 1. Inicializa o cliente do Supabase pegando as chaves automáticas do ambiente da Edge Function
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // 2. Pega as suas chaves VAPID que vamos configurar no próximo passo
    const publicKey = Deno.env.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY') ?? '';
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';

    webpush.setVapidDetails(
      'mailto:contato@piscineiromestre.app',
      publicKey,
      privateKey
    );

    // 3. Busca os celulares cadastrados
    const { data: assinaturas, error } = await supabaseAdmin
      .from('client_push_subscriptions')
      .select('subscription')
      .eq('client_id', clientId);

    if (error || !assinaturas || assinaturas.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhuma assinatura encontrada para este cliente.' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Monta e dispara
    const payload = JSON.stringify({
      title: titulo || 'Piscineiro Mestre',
      body: mensagem || 'Você tem uma atualização na sua piscina!',
      url: url || '/'
    });

    const promessasDeEnvio = assinaturas.map((ass) => 
      webpush.sendNotification(ass.subscription, payload)
        .catch((err) => console.error('Erro ao enviar para um dispositivo:', err))
    );

    await Promise.all(promessasDeEnvio);

    return new Response(
      JSON.stringify({ success: true, message: 'Notificações disparadas na nuvem!' }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro na Edge Function:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});