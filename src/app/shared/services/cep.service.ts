// src/app/shared/services/cep.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CepService {
  constructor(private http: HttpClient) {}

  async buscar(cep: string): Promise<ViaCepResponse> {
    const raw = (cep ?? '').replace(/\D/g, '');
    if (raw.length !== 8) return { erro: true };
    try {
      const url = `https://viacep.com.br/ws/${raw}/json/`;
      const data = await firstValueFrom(this.http.get<ViaCepResponse>(url));
      return data;
    } catch {
      return { erro: true };
    }
  }
}
