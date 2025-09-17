// src/app/core/models/profissional.model.ts
export interface Profissional {
  id: number;
  nome: string;
  email: string;
  dataNascimento: string; // ISO
  sexo: string;
  registeredBy: number;
  createdAt: string;
  updatedAt: string;
}
