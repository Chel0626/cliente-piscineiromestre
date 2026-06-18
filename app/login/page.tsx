// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseBrowser';

export default function LoginPage() {
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();
  
  // Usa o novo cliente configurado para cookies
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpa a formatação e monta o email fictício igual fazemos no backend
    const cleanPhone = telefone.replace(/\D/g, '');
    const email = `${cleanPhone}@clientes.piscineiromestre.app`;
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert('Credenciais inválidas. Verifique o telefone e a senha.');
      console.error('Erro de login:', error.message);
      return;
    }

    // O router.refresh() avisa ao Next.js para reavaliar os cookies no servidor
    router.refresh();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold text-cyan-700 mb-6 text-center">Piscineiro Mestre</h1>
        <div className="mb-4 text-sm text-slate-500 text-center">
          Acesso do Cliente
        </div>
        
        <input 
          type="tel" 
          placeholder="Número do Celular" 
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="w-full mb-4 p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
          required
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-6 p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
          required
        />
        <button 
          type="submit" 
          className="w-full bg-cyan-600 hover:bg-cyan-700 transition-colors text-white p-3 rounded-xl font-bold"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}