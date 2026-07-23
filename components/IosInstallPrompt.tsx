'use client';

import { useState, useEffect } from 'react';
import { Share, PlusSquare, X, ArrowDown } from 'lucide-react';

export function IosInstallPrompt() {
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Detecta se é um iPhone, iPad ou iPod
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    
    // 2. Detecta se o app JÁ ESTÁ instalado (rodando como PWA)
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      ('standalone' in window.navigator && (window.navigator as any).standalone === true);

    setIsIos(isIOSDevice);
    setIsStandalone(isStandaloneMode);
  }, []);

  if (!isIos || isStandalone || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 flex justify-center animate-in slide-in-from-bottom-10 duration-500">
      <div className="p-4 w-full max-w-sm bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-xl shadow-2xl relative">
        <button 
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">
            Instale o App MHM Piscinas
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Para acesso rápido e sem precisar digitar senha toda vez, instale no seu celular:
          </p>

          <div className="flex flex-col items-center w-full bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-3 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="bg-blue-100 text-blue-700 h-6 w-6 rounded-full flex items-center justify-center">1</span>
              <span>Toque no botão Compartilhar</span>
              <Share className="h-5 w-5 text-blue-500" />
            </div>
            
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="bg-blue-100 text-blue-700 h-6 w-6 rounded-full flex items-center justify-center">2</span>
              <span>Selecione Adicionar à Tela de Início</span>
              <PlusSquare className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </div>
          </div>

          <div className="pt-2 animate-bounce text-blue-500">
            <ArrowDown className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}