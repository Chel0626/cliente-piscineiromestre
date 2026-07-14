"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AccessTracker({ clientId }: { clientId: string }) {
  useEffect(() => {
    if (!clientId) {
      console.log("Rastreador: Sem Client ID fornecido.");
      return;
    }

    const updateLastAccess = async () => {
      console.log(`Rastreador: Tentando atualizar cliente ID: ${clientId}`);
      const agora = new Date().toISOString();

      const { data, error } = await supabase
        .from("clients")
        .update({ last_access: agora })
        .eq("id", clientId)
        .select(); // Adicionando .select() para forçar o retorno da linha atualizada

      if (error) {
        console.error("ERRO RASTREADOR (Supabase):", error.message);
      } else if (data && data.length > 0) {
        console.log(`Rastreador: Sucesso! Cliente atualizado:`, data[0].name);
      } else {
        console.log("Rastreador: Nenhuma linha atualizada. Verifique se o ID existe.");
      }
    };

    updateLastAccess();
  }, [clientId]);

  return null;
}