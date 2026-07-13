"use client";

import { useEffect } from "react";
// IMPORTANTE: Ajuste o caminho abaixo para onde fica o seu cliente do Supabase
import { supabase } from "@/lib/supabaseClient"; 

export default function AccessTracker({ clientId }: { clientId: string }) {
  useEffect(() => {
    if (!clientId) return;

    const updateLastAccess = async () => {
      try {
        await supabase
          .from("clients")
          .update({ last_access: new Date().toISOString() })
          .eq("id", clientId);
      } catch (error) {
        console.error("Erro ao atualizar último acesso:", error);
      }
    };

    updateLastAccess();
  }, [clientId]);

  return null; // É um fantasma: não renderiza nada na tela!
}