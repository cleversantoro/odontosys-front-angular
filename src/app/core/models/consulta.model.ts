// src/app/core/models/consulta.model.ts
import { Paciente } from './paciente.model';
import { Profissional } from './profissional.model';
import { Agendamento } from './agendamento.model';
import { Convenio } from './convenio.model';

export interface Consulta {
  id?: number;
  agendamentoId?: number | null;            // pode ser NULL em casos de encaixe
  convenioId?: number | null;
  pacienteId: number;
  profissionalId: number;
  dataHora: string;                         // ISO datetime
  anamnese?: string;
  diagnostico?: string;
  prescricao?: string;
  status: 'Aberta' | 'Finalizada';
  createdAt?: string;
  updatedAt?: string;

  // Campos extras para controle clínico
  procedimentos?: string;                   // descrição dos procedimentos realizados
  valorCobrado?: number;                    // valor total cobrado na consulta
  observacoes?: string;                     // notas adicionais do profissional
  dataConclusao?: string;                   // data em que a consulta foi finalizada

  // Relações opcionais (retornadas pela API com include)
  Paciente?: Paciente;
  Profissional?: Profissional;
  Agendamento?: Agendamento;
  Convenio?: Convenio;
}
