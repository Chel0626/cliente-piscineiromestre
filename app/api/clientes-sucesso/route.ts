// app/api/clientes-sucesso/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Busca apenas os clientes onde a coluna auth_user_id NÃO está vazia
    const { data: clientes, error } = await supabaseAdmin
      .from('clients')
      .select('name, phone')
      .not('auth_user_id', 'is', null)
      .order('name', { ascending: true }); // Já traz em ordem alfabética

    if (error) throw error;

    // Formata a lista para ficar bem legível
    const listaFormatada = clientes.map(cliente => ({
      nome: cliente.name,
      telefone: cliente.phone || 'Sem telefone'
    }));

    return NextResponse.json({
      message: 'Clientes com acesso liberado (Senha criada com sucesso)',
      total: clientes.length,
      clientes: listaFormatada
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}