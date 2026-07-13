// app/api/migrar-clientes/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usa o cliente admin com a SERVICE_ROLE_KEY para poder criar usuários sem restrição
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 1. Busca apenas os clientes que ainda não possuem usuário criado (auth_user_id nulo)
    const { data: clientes, error: fetchError } = await supabaseAdmin
      .from('clients')
      .select('id, name, phone, auth_user_id')
      .is('auth_user_id', null);

    if (fetchError) throw fetchError;

    const resultados = [];

    // 2. Loop para criar o login de cada cliente
    for (const cliente of clientes) {
      // Limpa a formatação deixando apenas números
      const telefoneLimpo = cliente.phone ? cliente.phone.replace(/\D/g, '') : null;
      
      // Se o telefone estiver em branco ou inválido, pula para o próximo para não quebrar
      if (!telefoneLimpo || telefoneLimpo.length < 8) {
        resultados.push({ 
          cliente: cliente.name, 
          status: 'erro', 
          motivo: 'Telefone em branco ou formato inválido' 
        });
        continue;
      }

      // Monta o e-mail exatamente no padrão do seu app de login
      const emailFicticio = `${telefoneLimpo}@clientes.piscineiromestre.app`;
      const senhaPadrao = '123456';

      // 3. Cria as credenciais no Supabase Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: emailFicticio,
        password: senhaPadrao,
        email_confirm: true // Já cria como confirmado para o cliente não precisar validar link
      });

      if (authError) {
        resultados.push({ 
          cliente: cliente.name, 
          status: 'erro', 
          motivo: authError.message 
        });
        continue;
      }

      // 4. Atualiza a tabela 'clients' vinculando o auth_user_id gerado
      const { error: updateError } = await supabaseAdmin
        .from('clients')
        .update({ auth_user_id: authUser.user.id })
        .eq('id', cliente.id);

      if (updateError) {
        resultados.push({ 
          cliente: cliente.name, 
          status: 'erro_vinculo', 
          motivo: updateError.message 
        });
      } else {
        resultados.push({ 
          cliente: cliente.name, 
          status: 'sucesso', 
          email: emailFicticio 
        });
      }
    }

    return NextResponse.json({
      message: 'Migração de senhas concluída!',
      total_analisado: clientes.length,
      detalhes: resultados
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}