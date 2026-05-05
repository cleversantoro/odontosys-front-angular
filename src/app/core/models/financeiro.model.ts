// src/app/core/models/financeiro.model.ts
// Baseado nos models Pagamento e Despesa da API

export interface Pagamento {
  id?: number;
  pacienteId: number;
  profissionalId: number;
  valor: number;
  tipoPagamento: 'Particular' | 'Convênio' | 'Comissão';
  status: 'Pendente' | 'Pago';
  data: string;                  // ISO datetime
  registeredBy?: number;
  createdAt?: string;
  updatedAt?: string;

  // Relações opcionais
  paciente?: { id: number; nome: string };
  profissional?: { id: number; nome: string };
}

export interface Despesa {
  id?: number;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;                  // ISO datetime
  registeredBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Visão unificada para exibição no módulo financeiro
export interface LancamentoFinanceiro {
  id?: number;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  status: 'Pendente' | 'Pago' | 'Cancelado';
}

// Resumo mensal para dashboard financeiro
export interface ResumoFinanceiro {
  mes: string;                   // "YYYY-MM"
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}
