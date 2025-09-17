// src/app/core/models/agendamento.model.ts
export interface Agendamento {
  id: number;
  pacienteId: number;
  profissionalId: number;
  convenioId: number;
  data: string; // ISO
  status: string;
  obs: string | null;
  registeredBy: number;
  createdAt: string;
  updatedAt: string;
}
