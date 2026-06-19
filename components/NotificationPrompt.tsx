// components/NotificationPrompt.tsx
'use client';
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

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
      alert('As notificações não são suportadas neste dispositivo/navegador.');
      return;
    }

    setLoading(true);
    try {
      const res = await Notification.requestPermission();
      setPermission(res);

      if (res === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicKey) throw new Error('Chave pública VAPID não configurada no .env');

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        // Dispara a Server Action e espera o retorno real do banco
        await onSaveSubscription(JSON.parse(JSON.stringify(subscription)));
        alert('Notificações ativadas com sucesso! 🎉');
      }
    } catch (error: any) {
      console.error('Erro ao ativar push no componente:', error);
      alert('Não foi possível salvar a ativação no banco de dados. Verifique o terminal.');
      // Reseta a permissão localmente para o cliente poder tentar de novo se falhou no banco
      setPermission('default');
    } finally {
      setLoading(false);
    }
  };

  if (permission !== 'default') return null;

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col justify-center items-center p-6 text-center animate-in fade-in duration-300">
      <div className="bg-cyan-500 text-white p-3 rounded-2xl mb-3 shadow-lg shadow-cyan-500/30">
        <Bell className="w-6 h-6 animate-bounce" />
      </div>
      <h4 className="font-bold text-white text-base">Deseja receber avisos da piscina?</h4>
      <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
        Ative para o seu celular apitar e avisar sempre que o piscineiro finalizar uma manutenção!
      </p>
      
      <button
        onClick={subscribeToPush}
        disabled={loading}
        className="mt-5 w-full max-w-[220px] bg-[#39FF14] text-slate-900 font-black text-xs py-3.5 px-6 rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all active:scale-95 disabled:opacity-50 tracking-wider"
      >
        {loading ? 'CONECTANDO...' : 'ATIVAR NOTIFICAÇÕES'}
      </button>
    </div>
  );
}