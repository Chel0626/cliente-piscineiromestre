// app/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { phoneToFictitiousEmail } from '@/lib/auth';

export default function LoginPage() {
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = phoneToFictitiousEmail(telefone);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert('Erro no login. Verifique seus dados.');
      return;
    }

    // TODO: Consultar tabela 'clientes' para verificar 'senha_alterada'
    // Se false -> router.push('/trocar-senha')
    // Se true -> router.push('/')
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold text-cyan-700 mb-6 text-center">Piscineiro Mestre</h1>
        {/* Adicionar máscara de telefone idealmente aqui (ex: react-input-mask) */}
        <input 
          type="tel" 
          placeholder="(11) 99999-9999" 
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="w-full mb-4 p-3 border rounded-xl"
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-6 p-3 border rounded-xl"
        />
        <button type="submit" className="w-full bg-cyan-600 text-white p-3 rounded-xl font-bold">
          Entrar
        </button>
      </form>
    </div>
  );
}