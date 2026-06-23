// app/trocar-senha/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseBrowser';
import { KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function TrocarSenhaPage() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleTrocarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);

    // Validações básicas antes de chamar o banco
    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem. Digite novamente.');
      return;
    }

    setLoading(true);

    // Como o usuário já está logado, o updateUser entende quem ele é automaticamente
    const { error } = await supabase.auth.updateUser({
      password: novaSenha
    });

    if (error) {
      setErro('Erro ao atualizar a senha. Tente novamente.');
      console.error(error);
      setLoading(false);
      return;
    }

    setSucesso(true);
    setLoading(false);
    
    // Aguarda uns segundos para o cliente ler a mensagem de sucesso e manda pra home
    setTimeout(() => {
      router.push('/');
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mb-3">
            <KeyRound className="w-6 h-6 text-cyan-700" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Trocar Senha</h1>
          <p className="text-sm text-slate-500 mt-1 text-center">
            Crie uma nova senha segura para o seu acesso.
          </p>
        </div>

        {erro && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{erro}</p>
          </div>
        )}

        {sucesso && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-700 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p>Senha atualizada com sucesso! Redirecionando...</p>
          </div>
        )}

        <form onSubmit={handleTrocarSenha} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha</label>
            <input 
              type="password" 
              placeholder="Mínimo 6 caracteres"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              disabled={loading || sucesso}
              className="w-full p-3 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-colors"
              required
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nova Senha</label>
            <input 
              type="password" 
              placeholder="Repita a nova senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              disabled={loading || sucesso}
              className="w-full p-3 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-colors"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || sucesso}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white p-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Atualizar Senha'}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/')}
            disabled={loading || sucesso}
            className="w-full text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
          >
            Cancelar e Voltar
          </button>
        </form>

      </div>
    </main>
  );
}