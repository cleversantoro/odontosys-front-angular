// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginPayload, RegisterPayload, AuthResponse, Usuario } from '../models/usuario.model';

const ACCESS_TOKEN_KEY  = 'odontosys_access_token';
const REFRESH_TOKEN_KEY = 'odontosys_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private readonly baseUrl = `${environment.apiUrl}/api/auth`;

  // ─── Registro ─────────────────────────────────────────────────────────────

  register(payload: RegisterPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/register`, payload);
  }

  // ─── Login ────────────────────────────────────────────────────────────────

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap(res => {
        localStorage.setItem(ACCESS_TOKEN_KEY,  res.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
      })
    );
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  logout(): void {
    const refreshToken = this.getRefreshToken();

    // Notifica a API (fire-and-forget — não bloqueia o logout local)
    if (refreshToken) {
      this.http.post(`${this.baseUrl}/logout`, { token: refreshToken })
        .subscribe({ error: () => {} });
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.router.navigate(['/sign-in']);
  }

  // ─── Token ────────────────────────────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /** Verifica se existe token válido (não expirado) */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payload = this.decodeToken(token);
    if (!payload?.['exp']) return false;

    const agora = Math.floor(Date.now() / 1000);
    return payload['exp'] > agora;
  }

  // ─── Usuário atual ────────────────────────────────────────────────────────

  /** Retorna os dados do usuário logado decodificando o JWT (sem chamada à API) */
  getUsuarioAtual(): Partial<Usuario> | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    if (!payload) return null;

    return {
      id:    payload['id'],
      email: payload['email'],
      nome:  payload['nome'],
      perfil: payload['perfil'],
    };
  }

  // ─── Refresh ──────────────────────────────────────────────────────────────

  /** Renova o accessToken usando o refreshToken armazenado */
  refresh(): Observable<AuthResponse> {
    const token = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, { token }).pipe(
      tap(res => {
        localStorage.setItem(ACCESS_TOKEN_KEY,  res.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
      })
    );
  }

  // ─── Decodificação do JWT (sem dependência externa) ───────────────────────

  private decodeToken(token: string): Record<string, any> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      // Base64url → Base64 padrão
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
