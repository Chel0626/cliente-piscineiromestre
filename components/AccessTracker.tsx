"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AccessTracker({ clientId }: { clientId: string }) {
  useEffect(() => {
    if (!clientId) return;

    const updateLastAccess = async () => {
      // Chamamos a função segura que criamos no banco de dados
      const { error } = await supabase.rpc("register_client_access", {
        client_uuid: clientId,
      });

      if (error) {
        console.error("Erro ao registrar acesso:", error.message);
      } else {
        console.log("Rastreador: Acesso registrado com total segurança!");
      }
    };

    updateLastAccess();
  }, [clientId]);

  return null;
}