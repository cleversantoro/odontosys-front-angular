// src/app/core/models/usuario.model.ts

export type PerfilUsuario = 'admin' | 'dentista' | 'recepcionista' | 'financeiro';

export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Payload para criação (inclui senha, não retornada pela API)
export interface UsuarioCreate extends Usuario {
  senha: string;
  confirmarSenha?: string;
}

// Payload para login
export interface LoginPayload {
  email: string;
  senha: string;
}

// Payload para registro de novo usuário
export interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
}

// Resposta da API após login/refresh (accessToken + refreshToken)
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}
