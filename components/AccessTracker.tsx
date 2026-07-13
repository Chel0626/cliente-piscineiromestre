"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // Confirme se o caminho está certo

export default function AccessTracker({ clientId }: { clientId: string }) {
  useEffect(() => {
    if (!clientId) return;

    const updateLastAccess = async () => {
      // O Supabase devolve o erro dentro do objeto de resposta
      const { error } = await supabase
        .from("clients")
        .update({ last_access: new Date().toISOString() })
        .eq("id", clientId);

      if (error) {
        console.error("ERRO REAL DO SUPABASE (RLS):", error.message);
      } else {
        console.log("Rastreador: Último acesso atualizado com sucesso!");
      }
    };

    updateLastAccess();
  }, [clientId]);

  return null;
}