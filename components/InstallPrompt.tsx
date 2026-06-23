// components/InstallPrompt.tsx
'use client';
import { useState, useEffect } from 'react';
import { X, Download, Share, Loader2 } from 'lucide-react';

export default function InstallPrompt() {
  const [isReady, setIsReady] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false); // <-- NOVO ESTADO DE CARREGAMENTO

  useEffect(() => {
    setIsReady(true);

    // Verifica se já está instalado (rodando como app)
    const isApp = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(isApp);

    // Se já estiver instalado, não faz mais nada
    if (isApp) return;

    // Verifica se é iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Se for iOS, mostramos o popup após alguns segundos
    if (isAppleDevice) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    // Se for Android/Chrome, ele captura o evento nativo de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    // NOVO: Captura o exato momento em que a instalação termina no Android
    const handleAppInstalled = () => {
      setIsInstalling(false);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled); // <-- Adiciona o ouvinte

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Mostra o prompt nativo do Android
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      // O cliente aceitou! Em vez de fechar, ativamos a tela de carregamento
      setIsInstalling(true);
    } else {
      // O cliente recusou a instalação, fechamos o popup
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const closePrompt = () => {
    setShowPrompt(false);
  };

  // Não renderiza nada no servidor ou se já estiver instalado/fechado
  if (!isReady || isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-4 border border-cyan-100 dark:border-slate-800 flex items-start gap-4">
        
        <div className="bg-cyan-100 dark:bg-cyan-900/30 p-3 rounded-xl shrink-0">
          <Download className="text-cyan-600 dark:text-cyan-400 w-6 h-6" />
        </div>
        
        <div className="flex-1 pt-1">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            {isInstalling ? 'Instalando...' : 'Instale o App'}
          </h3>
          
          {isIOS ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Para instalar no iPhone, toque em <Share className="w-3 h-3 inline pb-0.5" /> <strong>Compartilhar</strong> na barra inferior e depois em <strong>Adicionar à Tela de Início</strong>.
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {isInstalling 
                ? 'Aguarde um momento, o aplicativo está sendo adicionado à sua tela inicial.' 
                : 'Adicione nosso aplicativo à sua tela inicial para acesso rápido e notificações.'}
            </p>
          )}

          {!isIOS && (
            <>
              {/* Mostra o botão original apenas se NÃO estiver instalando */}
              {!isInstalling && deferredPrompt && (
                <button 
                  onClick={handleInstallClick}
                  className="mt-3 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors w-full"
                >
                  Instalar Agora
                </button>
              )}

              {/* Mostra a rodinha de carregamento APENAS durante a instalação */}
              {isInstalling && (
                <div className="mt-3 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold py-2 px-4 rounded-lg border border-slate-100 dark:border-slate-700 w-full">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                  Aguarde...
                </div>
              )}
            </>
          )}
        </div>

        {/* Esconde o "X" de fechar durante a instalação para evitar que o usuário clique acidentalmente */}
        {!isInstalling && (
          <button onClick={closePrompt} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        )}
        
      </div>
    </div>
  );
}