import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';


@Component({
  selector: 'app-paciente',
  imports: [CommonModule, PageBreadcrumbComponent, ReactiveFormsModule],
  templateUrl: './paciente.component.html',
  styleUrls: ['./paciente.component.css']
})
export class PacienteComponent {
  form: FormGroup;
  toastMsg: string | null = null;
  ufs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  private API_URL = 'http://localhost:5000/api/pacientes'; // ajuste para seu backend C#

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      // Dados pessoais
      nome: ['', [Validators.required, Validators.minLength(3)]],
      nascimento: ['', [Validators.required]],
      cpf: ['', [Validators.required, this.cpfValidator]],
      rg: [''],
      genero: [''],
      estadoCivil: [''],
      profissao: [''],

      // Contato
      tel1: ['', [Validators.required, Validators.minLength(14)]],
      tel2: [''],
      email: ['', [Validators.required, Validators.email]],

      // Endereço
      cep: ['', [Validators.required, Validators.minLength(9)]],
      numero: ['', [Validators.required]],
      logradouro: ['', [Validators.required]],
      complemento: [''],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required]],

      // Emergência
      contatoEmerg: ['', [Validators.required]],
      telEmerg: ['', [Validators.required, Validators.minLength(14)]],
      parentesco: [''],

      // Anamnese
      alergia: ['nao', Validators.required],
      alergiaQuais: [''],
      cronica: ['nao', Validators.required],
      cronicaQuais: [''],
      medicacao: ['nao', Validators.required],
      medicacaoQuais: [''],
      fumante: ['nao', Validators.required],
      sangramento: ['nao', Validators.required],
      diabetico: ['nao', Validators.required],
      cardiaco: ['nao', Validators.required],
      gravida: ['nao', Validators.required],
    });

    // Máscaras leves via valueChanges
    this.form.get('cpf')!.valueChanges.subscribe(v => this.patchMasked('cpf', this.maskCPF(v)));
    this.form.get('cep')!.valueChanges.subscribe(v => this.patchMasked('cep', this.maskCEP(v)));
    ['tel1', 'tel2', 'telEmerg'].forEach(ctrl => {
      this.form.get(ctrl)!.valueChanges.subscribe(v => this.patchMasked(ctrl, this.maskPhone(v)));
    });

    // Limpa campos condicionais
    this.form.get('alergia')!.valueChanges.subscribe(v => v === 'nao' && this.form.get('alergiaQuais')!.setValue(''));
    this.form.get('cronica')!.valueChanges.subscribe(v => v === 'nao' && this.form.get('cronicaQuais')!.setValue(''));
    this.form.get('medicacao')!.valueChanges.subscribe(v => v === 'nao' && this.form.get('medicacaoQuais')!.setValue(''));
  }


  // No topo da classe:
  tabs = [
    { key: 'dados', label: 'Dados Pessoais' },
    { key: 'endereco', label: 'Endereço' },
    { key: 'contato', label: 'Contato' },
    { key: 'emerg', label: 'Informações de Emergência' },
    { key: 'anamnese', label: 'Questionário (Anamnese)' },
  ];
  currentTab = 0;

  setTab(i: number) {
    if (i < 0 || i >= this.tabs.length) return;
    this.currentTab = i;
    //queueMicrotask(() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }


  // Acessibilidade: setas para navegar entre abas (←/→)
  onTabsKeydown(ev: KeyboardEvent) {
    if (ev.key === 'ArrowRight') {
      this.setTab((this.currentTab + 1) % this.tabs.length);
      ev.preventDefault();
    } else if (ev.key === 'ArrowLeft') {
      this.setTab((this.currentTab - 1 + this.tabs.length) % this.tabs.length);
      ev.preventDefault();
    }
  }

  // --- Mapeamento de campos por aba (use os nomes exatos dos formControls) ---
  sectionControls: Record<string, string[]> = {
    dados: [
      'nome', 'nascimento', 'cpf', 'rg', 'genero', 'estadoCivil', 'profissao'
    ],
    endereco: [
      'cep', 'numero', 'logradouro', 'complemento', 'bairro', 'cidade', 'estado'
    ],
    contato: [
      'tel1', 'tel2', 'email'
    ],
    emerg: [
      'contatoEmerg', 'telEmerg', 'parentesco'
    ],
    anamnese: [
      'alergia', 'alergiaQuais', 'cronica', 'cronicaQuais', 'medicacao', 'medicacaoQuais',
      'fumante', 'sangramento', 'diabetico', 'cardiaco', 'gravida'
    ],
  };

  // Para controlar a exibição de erros antes do usuário tocar no campo
  submitted = false;

  // --- Helpers de erro por aba ---
  tabHasErrors(i: number): boolean {
    const key = this.tabs[i].key;
    return this.sectionControls[key].some(ctrl => {
      const c = this.form.get(ctrl);
      if (!c) return false;
      // Mostra badge se já submetido OU se o campo foi tocado/alterado
      const shouldShow = this.submitted || c.touched || c.dirty;
      return shouldShow && c.invalid;
    });
  }

  tabErrorCount(i: number): number {
    const key = this.tabs[i].key;
    let count = 0;
    for (const ctrl of this.sectionControls[key]) {
      const c = this.form.get(ctrl);
      if (!c) continue;
      const shouldShow = this.submitted || c.touched || c.dirty;
      if (shouldShow && c.invalid) count++;
    }
    return count;
  }

  // ---------- Helpers ----------
  invalid(path: string) {
    const c = this.form.get(path);
    return !!c && c.invalid && (c.dirty || c.touched);
  }
  private onlyDigits(v: any) { return String(v ?? '').replace(/\D/g, ''); }
  private patchMasked(ctrl: string, masked: string) {
    const c = this.form.get(ctrl)!;
    if (c.value !== masked) c.setValue(masked, { emitEvent: false });
  }
  private maskCPF(v: any) {
    let s = this.onlyDigits(v).slice(0, 11);
    s = s.replace(/(\d{3})(\d)/, '$1.$2');
    s = s.replace(/(\d{3})(\d)/, '$1.$2');
    s = s.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return s;
  }
  private maskCEP(v: any) {
    const s = this.onlyDigits(v).slice(0, 8);
    return s.replace(/(\d{5})(\d)/, '$1-$2');
  }
  private maskPhone(v: any) {
    const s = this.onlyDigits(v).slice(0, 11);
    if (s.length <= 10) return s.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    return s.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  }

  // ---------- Validators ----------
  private cpfValidator = (c: AbstractControl): ValidationErrors | null => {
    const cpf = this.onlyDigits(c.value);
    if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return { cpf: true };
    let soma = 0, resto: number;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11; if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return { cpf: true };
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11; if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return { cpf: true };
    return null;
  };

  // ---------- CEP (ViaCEP) ----------
  async onCepBlur() {
    const ctrl = this.form.get('cep')!;
    const raw = this.onlyDigits(ctrl.value);
    if (raw.length !== 8) return;
    try {
      const data: any = await this.http.get(`https://viacep.com.br/ws/${raw}/json/`).toPromise();
      if (data?.erro) { this.showToast('⚠️ CEP não encontrado.'); return; }
      this.form.patchValue({
        logradouro: data?.logradouro ?? '',
        bairro: data?.bairro ?? '',
        cidade: data?.localidade ?? '',
        estado: data?.uf ?? ''
      });
    } catch {
      this.showToast('⚠️ Erro ao consultar CEP.');
    }
  }

  // ---------- Submit ----------
  async onSubmit() {

    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      // Encontra a primeira aba que tenha erro e foca nela
      const firstBadTab = this.tabs.findIndex((_, i) => this.tabHasErrors(i));
      if (firstBadTab >= 0) this.setTab(firstBadTab);

      this.showToast('⚠️ Corrija os campos destacados.');
      return;
    }

    const v = this.form.value;
    const payload = {
      nome: v.nome,
      nascimento: v.nascimento,
      cpf: this.onlyDigits(v.cpf),
      rg: v.rg,
      genero: v.genero,
      estadoCivil: v.estadoCivil,
      profissao: v.profissao,
      contato: {
        tel1: this.onlyDigits(v.tel1),
        tel2: this.onlyDigits(v.tel2 ?? ''),
        email: v.email
      },
      endereco: {
        cep: this.onlyDigits(v.cep),
        numero: v.numero,
        logradouro: v.logradouro,
        complemento: v.complemento,
        bairro: v.bairro,
        cidade: v.cidade,
        estado: v.estado
      },
      emergencia: {
        contato: v.contatoEmerg,
        telefone: this.onlyDigits(v.telEmerg),
        parentesco: v.parentesco
      },
      anamnese: {
        alergia: v.alergia,
        alergiaQuais: v.alergiaQuais,
        cronica: v.cronica,
        cronicaQuais: v.cronicaQuais,
        medicacao: v.medicacao,
        medicacaoQuais: v.medicacaoQuais,
        fumante: v.fumante,
        sangramento: v.sangramento,
        diabetico: v.diabetico,
        cardiaco: v.cardiaco,
        gravida: v.gravida
      }
    };

    try {
      await this.http.post(this.API_URL, payload).toPromise();
      this.showToast('✅ Paciente cadastrado com sucesso!');
      this.submitted = false;
      // this.form.reset({ alergia:'nao', cronica:'nao', medicacao:'nao', fumante:'nao', sangramento:'nao', diabetico:'nao', cardiaco:'nao', gravida:'nao' });
    } catch {
      this.showToast('❌ Erro ao salvar. Tente novamente.');
    }
  }

  onClear() {
    this.form.reset({
      alergia: 'nao', cronica: 'nao', medicacao: 'nao', fumante: 'nao', sangramento: 'nao', diabetico: 'nao', cardiaco: 'nao', gravida: 'nao'
    });
    this.submitted = false;
    this.showToast('Formulário limpo.');
  }

  onCancel() {
    if (history.length > 1) history.back();
    else this.onClear();
  }

  private showToast(msg: string) {
    this.toastMsg = msg;
    setTimeout(() => this.toastMsg = null, 2600);
  }
}
