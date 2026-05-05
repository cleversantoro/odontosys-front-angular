// src/app/core/models/profissional.model.ts

export interface Especialidade {
  id: number;
  nome: string;
  descricao?: string;
}

export interface Departamento {
  id: number;
  nome: string;
  descricao?: string;
}

export interface ProfissionalTelefone {
  id?: number;
  numero: string;
  tipo: 'celular' | 'residencial' | 'comercial';
}

export interface Profissional {
  id?: number;
  nome: string;
  email: string;
  dataNascimento: string;                   // ISO "YYYY-MM-DD"
  sexo: 'Masculino' | 'Feminino';
  cro?: string;                             // Conselho Regional de Odontologia
  status?: 'ativo' | 'inativo';            // controle de acesso / exibição
  registeredBy?: number;
  createdAt?: string;
  updatedAt?: string;

  // Relações opcionais (retornadas pela API com include)
  Especialidades?: Especialidade[];
  Departamentos?: Departamento[];
  Telefones?: ProfissionalTelefone[];
}
