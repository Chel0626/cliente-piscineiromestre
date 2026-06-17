// lib/auth.ts
/**
 * Converte um número de telefone apenas numérico em um email fictício 
 * para uso com o Supabase Auth.
 */
export const phoneToFictitiousEmail = (phone: string): string => {
  // Remove tudo que não for número (máscaras, espaços, parênteses)
  const cleanPhone = phone.replace(/\D/g, '');
  return `${cleanPhone}@clientes.piscineiromestre.app`;
};