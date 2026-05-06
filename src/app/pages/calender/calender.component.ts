import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { EventInput, CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { forkJoin } from 'rxjs';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { AgendamentoService } from '../../core/services/agendamento.service';
import { PacientesService } from '../../core/services/paciente.service';
import { ProfissionalService } from '../../core/services/profissional.service';
import { ConvenioService } from '../../core/services/convenio.service';
import { Agendamento } from '../../core/models/agendamento.model';
import { Paciente } from '../../core/models/paciente.model';
import { Profissional } from '../../core/models/profissional.model';
import { Convenio } from '../../core/models/convenio.model';

const STATUS_COLOR: Record<string, string> = {
  Agendado:   '#3b82f6',
  Confirmado: '#22c55e',
  Cancelado:  '#ef4444',
  Realizado:  '#f59e0b',
};

interface AgendamentoEvent extends EventInput {
  extendedProps: { agendamento: Agendamento };
}

@Component({
  selector: 'app-calender',
  imports: [CommonModule, FormsModule, FullCalendarModule, ModalComponent],
  templateUrl: './calender.component.html',
  styles: ``
})
export class CalenderComponent implements OnInit {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  // Reference data
  pacientes: Paciente[] = [];
  filteredPacientes: Paciente[] = [];
  profissionais: Profissional[] = [];
  convenios: Convenio[] = [];

  // Modal state
  isOpen = false;
  saving = false;
  deleting = false;
  selectedAgendamentoId: number | null = null;

  // Form
  form: {
    pacienteId: number | null;
    profissionalId: number | null;
    convenioId: number | null;
    data: string;
    hora: string;
    status: Agendamento['status'];
    tipoProcedimento: string;
    obs: string;
  } = this.emptyForm();

  pacienteSearch = '';
  statusOptions: Agendamento['status'][] = ['Agendado', 'Confirmado', 'Cancelado', 'Realizado'];

  calendarOptions!: CalendarOptions;

  constructor(
    private agendamentoService: AgendamentoService,
    private pacientesService: PacientesService,
    private profissionalService: ProfissionalService,
    private convenioService: ConvenioService,
  ) {}

  ngOnInit() {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: 'pt-br',
      headerToolbar: {
        left: 'prev,next addEventButton',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      selectable: true,
      events: [],
      select: (info) => this.handleDateSelect(info),
      eventClick: (info) => this.handleEventClick(info),
      customButtons: {
        addEventButton: {
          text: 'Novo Agendamento +',
          click: () => this.openModal()
        }
      },
      eventContent: (arg) => this.renderEventContent(arg)
    };
    this.loadData();
  }

  // ---------- Data loading ----------

  private loadData() {
    forkJoin({
      agendamentos: this.agendamentoService.list(),
      pacientes: this.pacientesService.list(),
      profissionais: this.profissionalService.list(),
      convenios: this.convenioService.list(),
    }).subscribe({
      next: ({ agendamentos, pacientes, profissionais, convenios }) => {
        this.pacientes = pacientes;
        this.filteredPacientes = pacientes;
        this.profissionais = profissionais;
        this.convenios = convenios;
        this.applyEvents(agendamentos);
      },
      error: () => {}
    });
  }

  private reloadEvents() {
    this.agendamentoService.list().subscribe({
      next: (list) => this.applyEvents(list),
      error: () => {}
    });
  }

  private applyEvents(agendamentos: Agendamento[]) {
    const events: AgendamentoEvent[] = agendamentos.map(a => this.toEvent(a));
    this.calendarOptions = { ...this.calendarOptions, events };
  }

  private toEvent(a: Agendamento): AgendamentoEvent {
    const pacNome = a.Pacientes?.nome ?? `Paciente #${a.pacienteId}`;
    const profNome = a.Profissionais?.nome ?? `Dr. #${a.profissionalId}`;
    const hora = a.data?.substring(11, 16) ?? '';
    const title = hora ? `${hora} — ${pacNome} / ${profNome}` : `${pacNome} / ${profNome}`;
    return {
      id: String(a.id),
      title,
      start: a.data,
      color: STATUS_COLOR[a.status] ?? '#6b7280',
      extendedProps: { agendamento: a }
    };
  }

  // ---------- Calendar handlers ----------

  handleDateSelect(selectInfo: DateSelectArg) {
    this.resetForm();
    const d = new Date(selectInfo.startStr);
    this.form.data = d.toISOString().split('T')[0];
    this.form.hora = '08:00';
    this.openModal();
  }

  handleEventClick(clickInfo: EventClickArg) {
    const a: Agendamento = clickInfo.event.extendedProps['agendamento'];
    this.resetForm();
    this.selectedAgendamentoId = a.id ?? null;
    this.form.pacienteId = a.pacienteId;
    this.form.profissionalId = a.profissionalId;
    this.form.convenioId = a.convenioId ?? null;
    this.form.status = a.status;
    this.form.tipoProcedimento = a.tipoProcedimento ?? '';
    this.form.obs = a.obs ?? '';
    if (a.data) {
      this.form.data = a.data.substring(0, 10);
      this.form.hora = a.data.length > 10 ? a.data.substring(11, 16) : '08:00';
    }
    this.openModal();
  }

  // ---------- Save / Delete ----------

  handleSave() {
    if (!this.form.pacienteId || !this.form.profissionalId || !this.form.data) return;
    const dataISO = `${this.form.data}T${this.form.hora || '08:00'}:00`;
    const payload: Partial<Agendamento> = {
      pacienteId:       Number(this.form.pacienteId),
      profissionalId:   Number(this.form.profissionalId),
      convenioId:       this.form.convenioId ? Number(this.form.convenioId) : null,
      data:             dataISO,
      status:           this.form.status,
      tipoProcedimento: this.form.tipoProcedimento || undefined,
      obs:              this.form.obs || undefined,
    };
    this.saving = true;
    const req$ = this.selectedAgendamentoId
      ? this.agendamentoService.update(this.selectedAgendamentoId, payload)
      : this.agendamentoService.create(payload);
    req$.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.reloadEvents(); },
      error: () => { this.saving = false; }
    });
  }

  handleDelete() {
    if (!this.selectedAgendamentoId) return;
    this.deleting = true;
    this.agendamentoService.remove(this.selectedAgendamentoId).subscribe({
      next: () => { this.deleting = false; this.closeModal(); this.reloadEvents(); },
      error: () => { this.deleting = false; }
    });
  }

  // ---------- Patient filter ----------

  filterPacientes() {
    const q = this.pacienteSearch.toLowerCase();
    this.filteredPacientes = q
      ? this.pacientes.filter(p => p.nome.toLowerCase().includes(q))
      : this.pacientes;
  }

  // ---------- Modal helpers ----------

  openModal() { this.isOpen = true; }

  closeModal() {
    this.isOpen = false;
    this.resetForm();
  }

  private resetForm() {
    this.selectedAgendamentoId = null;
    this.pacienteSearch = '';
    this.filteredPacientes = this.pacientes;
    this.form = this.emptyForm();
  }

  private emptyForm() {
    return {
      pacienteId:       null as number | null,
      profissionalId:   null as number | null,
      convenioId:       null as number | null,
      data:             '',
      hora:             '08:00',
      status:           'Agendado' as Agendamento['status'],
      tipoProcedimento: '',
      obs:              '',
    };
  }

  renderEventContent(eventInfo: any) {
    const status: string = eventInfo.event.extendedProps?.agendamento?.status ?? '';
    const badge = status
      ? `<span style="font-size:0.65rem;opacity:0.8;margin-left:4px">[${status}]</span>`
      : '';
    return {
      html: `<div class="p-1 overflow-hidden text-xs font-medium truncate">${eventInfo.event.title}${badge}</div>`
    };
  }
}
