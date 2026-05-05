// src/app/core/models/orcamento.model.ts

export interface OrcamentoItem {
  id?: number;
  descricao: string;             // ex: "Extração do dente 18"
  dente?: string;                // numeração do dente (ex: "18", "36")
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;            // quantidade * valorUnitario
}

export interface Orcamento {
  id?: number;
  pacienteId: number;
  profissionalId: number;
  convenioId?: number | null;
  itens: OrcamentoItem[];
  valorTotal: number;
  status: 'Pendente' | 'Aprovado' | 'Recusado' | 'Expirado';
  validade?: string;             // ISO "YYYY-MM-DD"
  observacoes?: string;
  registeredBy?: number;
  createdAt?: string;
  updatedAt?: string;

  // Relações opcionais (retornadas pela API com include)
  Paciente?: { id: number; nome: string };
  Profissional?: { id: number; nome: string };
}
