export interface Paciente {
  id: number;
  codigo: string;
  nome: string;
  email: string;
  dataNascimento: string; // ISO
  sexo: string;
  estadoCivil: string;
  nacionalidade: string;
  naturalidade: string;
  estado: string;
  dataEntrada: string;    // pode vir "YYYY-MM-DD"
  obs: string | null;
  registeredBy: number;
  createdAt: string;
  updatedAt: string;
}
