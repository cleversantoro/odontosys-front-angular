import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface Paciente {
  id: number;
  nome: string;
  nascimento?: string;
  cpf?: string;
  rg?: string;
  genero?: string;
  estadoCivil?: string;
  profissao?: string;
  contato?: { tel1?: string; tel2?: string; email?: string };
  endereco?: { cep?: string; numero?: string; logradouro?: string; complemento?: string; bairro?: string; cidade?: string; estado?: string };
  emergencia?: { contato?: string; telefone?: string; parentesco?: string };
  anamnese?: any;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = 'http://localhost:5000/api/pacientes'; // ajuste se necessário

@Injectable({ providedIn: 'root' })
export class PacientesService {
  constructor(private http: HttpClient) {}

  list(query?: { search?: string; page?: number; pageSize?: number; sort?: string; dir?: 'asc'|'desc' }) {
    // Se sua API tem paginação server-side, use params reais aqui.
    let params = new HttpParams();
    if (query?.search) params = params.set('q', query.search);
    if (query?.page) params = params.set('page', query.page);
    if (query?.pageSize) params = params.set('pageSize', query.pageSize);
    if (query?.sort) params = params.set('sort', query.sort);
    if (query?.dir) params = params.set('dir', query.dir);
    return firstValueFrom(this.http.get<Paciente[]>(API_URL, { params }));
  }

  getById(id: number) {
    return firstValueFrom(this.http.get<Paciente>(`${API_URL}/${id}`));
  }

  create(payload: Partial<Paciente>) {
    return firstValueFrom(this.http.post(API_URL, payload));
  }

  update(id: number, payload: Partial<Paciente>) {
    return firstValueFrom(this.http.put(`${API_URL}/${id}`, payload));
  }

  remove(id: number) {
    return firstValueFrom(this.http.delete(`${API_URL}/${id}`));
  }
}
