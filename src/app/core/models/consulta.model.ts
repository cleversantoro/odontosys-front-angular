// src/app/core/models/consulta.model.ts
import { Paciente } from './paciente.model';
import { Profissional } from './profissional.model';
import { Agendamento } from './agendamento.model';
import { Convenio } from './convenio.model';

export interface Consulta {
  id: number;
  agendamentoId: number;
  convenioId: number;
  pacienteId: number;
  profissionalId: number;
  dataHora: string; // ISO
  anamnese: string;
  diagnostico: string;
  prescricao: string;
  status: string;   // "Finalizada" etc.
  createdAt: string;
  updatedAt: string;

  Paciente?: Paciente;
  Profissional?: Profissional;
  Agendamento?: Agendamento;
  Convenio?: Convenio;
}
