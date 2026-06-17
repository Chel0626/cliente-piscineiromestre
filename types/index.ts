// types/index.ts

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
  auth_user_id: string;
  senha_alterada: boolean;
}

export interface Relatorio {
  id: string;
  cliente_id: string;
  data_visita: string;
  ph: number;
  cloro: number;
  alcalinidade: number;
  observacoes: string | null;
  foto_url: string | null;
  criado_em: string;
}

export interface ProdutoAplicado {
  id: string;
  relatorio_id: string;
  nome_produto: string;
  quantidade: string;
}

export interface SolicitacaoProduto {
  id: string;
  relatorio_id: string;
  cliente_id: string;
  status: 'pendente' | 'solicitado_piscineiro' | 'cliente_providencia';
  criado_em: string;
}