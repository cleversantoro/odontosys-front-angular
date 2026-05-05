export interface PacienteTelefone {
  id?: number;
  numero: string;
  tipo: 'celular' | 'residencial' | 'comercial';
  contato_id?: number;
  contato_tipo?: 'paciente' | 'profissional';
}

export interface PacienteEndereco {
  id?: number;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  pais?: string;
  contato_id?: number;
  contato_tipo?: 'paciente' | 'profissional';
}

export interface PacienteDadoClinico {
  id?: number;
  grupoSanguineo?: string;
  alergias?: string;
  medicamentosContinuos?: string;
  doencasPreExistentes?: string;
  planoSaude?: string;
  numeroApolice?: string;
  pacienteId?: number;
}

export interface Paciente {
  id?: number;
  codigo?: string;
  nome: string;
  email: string;
  dataNascimento: string;        // ISO "YYYY-MM-DD"
  sexo: 'Masculino' | 'Feminino';
  estadoCivil?: 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)';
  nacionalidade?: string;
  naturalidade?: string;
  estado?: string;
  dataEntrada?: string;          // "YYYY-MM-DD"
  obs?: string | null;
  registeredBy?: number;
  createdAt?: string;
  updatedAt?: string;

  // Relações opcionais (retornadas pela API com include)
  Telefones?: PacienteTelefone[];
  Enderecos?: PacienteEndereco[];
  DadosClinicos?: PacienteDadoClinico[];

  // Campos legados / payloads de formulário (estrutura flat usada no front)
  cpf?: string;
  contato?: { email?: string; tel1?: string; tel2?: string };
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
}
