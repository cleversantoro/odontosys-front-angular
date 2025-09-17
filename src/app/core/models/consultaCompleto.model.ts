// src/app/core/models/consulta.model.ts
export interface ConsultaCompleto {
  id: number;
  codigo: string;
  pacienteId: number;
  nome_paciente: string;
  dataNascimento: string;
  sexo: string;
  email_paciente: string;
  convenioId: number;
  convenio: string;
  doencas_paciente: null;
  profissionalId: number;
  nome_profissional: string;
  especialidades: string;
  departamentos: string;
  situacao: string;
  obs: string;
  data_agendamento: string;
  data: string;
  hora: string;
  agendadoPor: string;
}
