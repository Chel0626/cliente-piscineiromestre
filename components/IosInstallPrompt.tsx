'use client';

import { useState, useEffect } from 'react';
import { Share, PlusSquare, X, ArrowDown, MoreHorizontal, Pointer } from 'lucide-react';

export function IosInstallPrompt() {
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Detecta se é dispositivo Apple
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    
    // Detecta se já está instalado (standalone)
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      ('standalone' in window.navigator && (window.navigator as any).standalone === true);

    setIsIos(isIOSDevice);
    setIsStandalone(isStandaloneMode);
  }, []);

  // O "Motor do GIF": Alterna os passos automaticamente a cada 2.5 segundos
  useEffect(() => {
    if (!isIos || isStandalone || isDismissed) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 2500);
    
    return () => clearInterval(interval);
  }, [isIos, isStandalone, isDismissed]);

  if (!isIos || isStandalone || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-[100] px-4 flex justify-center animate-in slide-in-from-bottom-10 duration-500">
      <div className="p-4 w-full max-w-sm bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Botão de Fechar */}
        <button 
          className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 z-10"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
              Instale o App
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Siga os passos abaixo para fixar no celular:
            </p>
          </div>

          {/* O "Televisor" do nosso GIF em código */}
          <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-4 h-[120px] relative flex items-center justify-center border border-slate-200 dark:border-slate-700">
            
            {/* PASSO 1 */}
            <div className={`absolute flex flex-col items-center transition-all duration-500 ${currentStep === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">1</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Toque em Opções / Compartilhar</span>
              </div>
              <div className="flex gap-4 items-center bg-white dark:bg-slate-700 px-4 py-2 rounded-lg shadow-sm">
                <MoreHorizontal className="h-6 w-6 text-slate-400" />
                <div className="relative">
                  <Share className="h-6 w-6 text-blue-500" />
                  <Pointer className="h-5 w-5 text-slate-800 absolute -bottom-3 -right-3 animate-ping" />
                </div>
              </div>
            </div>

            {/* PASSO 2 */}
            <div className={`absolute flex flex-col items-center transition-all duration-500 ${currentStep === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">2</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Role ou toque em "Mais"</span>
              </div>
              <div className="flex items-center bg-white dark:bg-slate-700 px-6 py-2 rounded-lg shadow-sm">
                <div className="relative">
                  <MoreHorizontal className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                  <Pointer className="h-5 w-5 text-slate-800 absolute -bottom-3 -right-3 animate-bounce" />
                </div>
              </div>
            </div>

            {/* PASSO 3 */}
            <div className={`absolute flex flex-col items-center transition-all duration-500 ${currentStep === 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">3</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Adicionar à Tela de Início</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-700 px-4 py-2 rounded-lg shadow-sm">
                <span className="text-sm font-medium">Adicionar à Tela...</span>
                <div className="relative">
                  <PlusSquare className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  <Pointer className="h-5 w-5 text-slate-800 absolute -bottom-2 -right-3 animate-pulse" />
                </div>
              </div>
            </div>

          </div>

          {/* Seta animada apontando para a borda inferior do celular */}
          <div className="pt-1 animate-bounce text-blue-500">
            <ArrowDown className="h-6 w-6" />
          </div>

        </div>
      </div>
    </div>
  );
}