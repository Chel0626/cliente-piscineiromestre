// components/NotificationPrompt.tsx
'use client';
import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';

interface Props {
  clientId: string;
  onSaveSubscription: (subscription: any) => Promise<void>;
}

export default function NotificationPrompt({ clientId, onSaveSubscription }: Props) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Função necessária para converter a chave pública VAPID para o formato do navegador
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('As notificações não são suportadas neste navegador.');
      return;
    }

    setLoading(true);
    try {
      // 1. Pede permissão nativa ao sistema operacional
      const res = await Notification.requestPermission();
      setPermission(res);

      if (res === 'granted') {
        // 2. Aguarda o Service Worker estar pronto
        const registration = await navigator.serviceWorker.ready;

        // 3. Subscreve o telemóvel no servidor de Push do Google/Apple
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicKey) throw new Error('Chave pública VAPID em falta');

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        // 4. Envia o token gerado para guardar no Supabase
        await onSaveSubscription(JSON.parse(JSON.stringify(subscription)));
        alert('Notificações ativadas com sucesso! 🎉');
      }
    } catch (error) {
      console.error('Erro ao ativar push:', error);
      alert('Não foi possível ativar as notificações.');
    } finally {
      setLoading(false);
    }
  };

  // Se já estiver aceite ou bloqueado, não exibe o banner de ativação
  if (permission !== 'default') return null;

  return (
    <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 flex items-center justify-between gap-4 mt-4">
      <div className="flex gap-3 items-center">
        <div className="bg-cyan-500 text-white p-2 rounded-xl">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm">Deseja receber avisos?</h4>
          <p className="text-xs text-slate-500 mt-0.5">Ative para saber quando o piscineiro fizer uma visita.</p>
        </div>
      </div>
      <button
        onClick={subscribeToPush}
        disabled={loading}
        className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors shrink-0 disabled:opacity-50"
      >
        {loading ? 'A ativar...' : 'Ativar'}
      </button>
    </div>
  );
}