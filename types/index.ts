// types/index.ts

// ... (mantenha a interface Cliente e outras)

export interface Visit {
  id: string;
  client_id: string;
  ph: number;
  chlorine: number;
  alkalinity: number;
  description: string | null;
  photo_url: string | null;
  water_condition: string;
  // Assumindo que array no Supabase (text[]) ou JSONB. 
  // Ajuste o tipo se for diferente no seu banco.
  products_used: string[]; 
  checklist: string[]; 
  created_at: string; // Coluna padrão de data do Supabase
}