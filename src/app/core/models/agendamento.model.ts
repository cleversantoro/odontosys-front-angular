// src/app/core/models/agendamento.model.ts
export interface Agendamento {
  id?: number;
  pacienteId: number;
  profissionalId: number;
  convenioId?: number | null;
  data: string;                                                         // ISO datetime
  status: 'Agendado' | 'Confirmado' | 'Cancelado' | 'Realizado';
  obs?: string | null;
  registeredBy?: number;
  createdAt?: string;
  updatedAt?: string;

  // Campos extras para o calendário (FullCalendar)
  titulo?: string;                                                      // exibido no evento
  cor?: string;                                                         // hex ou nome CSS
  duracao?: number;                                                     // em minutos
  tipoProcedimento?: string;                                            // ex: "Extração", "Limpeza"
  sala?: string;                                                        // sala / cadeira

  // Relações opcionais (retornadas pela API com include)
  Pacientes?: { id: number; nome: string };
  Profissionais?: { id: number; nome: string };
  Convenios?: { id: number; nome: string };
}
