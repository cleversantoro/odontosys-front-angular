import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { CalenderComponent } from './pages/calender/calender.component';

import { ConsultaComponent } from './pages/consulta/consulta.component';

import { PacientesAddComponent } from './pages/paciente/pacientes-add/pacientes-add.component';
import { PacientesListComponent } from './pages/paciente/pacientes-list/pacientes-list.component';
import { PacientesDetailComponent } from './pages/paciente/pacientes-detail/pacientes-detail.component';

import { ProfissionalAddComponent } from './pages/profissional/profissional-add/profissional-add.component';
import { ProfissionalListComponent } from './pages/profissional/profissional-list/profissional-list.component';
import { ProfissionalDetailComponent } from './pages/profissional/profissional-detail/profissional-detail.component';

import { ConveniosListComponent } from './pages/convenios/convenios-list/convenios-list.component';

import { OrcamentoListComponent } from './pages/orcamento/orcamento-list/orcamento-list.component';
import { OrcamentoAddComponent } from './pages/orcamento/orcamento-add/orcamento-add.component';
import { OrcamentoDetailComponent } from './pages/orcamento/orcamento-detail/orcamento-detail.component';

import { FinanceiroListComponent } from './pages/financeiro/financeiro-list/financeiro-list.component';

import { UsuariosListComponent } from './pages/usuarios/usuarios-list/usuarios-list.component';
import { RelatoriosComponent } from './pages/relatorios/relatorios.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      //Consulta
      {
        path: 'consulta',
        component: ConsultaComponent,
        pathMatch: 'full',
        title:
          'Consultas | OdontoSys - Consulta de Clientes',
      },
      //Paciente
      {
        path: 'paciente/novo',
        component: PacientesAddComponent,
        pathMatch: 'full',
        title:
          'Pacientes Cadastro| OdontoSys - Cadastro de Pacientes',
      },
      {
        path: 'paciente/lista',
        component: PacientesListComponent,
        pathMatch: 'full',
        title:
          'Pacientes Lista| OdontoSys - Consulta de Pacientes',
      },
      {
        path: 'paciente/detalhe/:id',
        component: PacientesDetailComponent,
        pathMatch: 'full',
        title:
          'Paciente Detalhe | OdontoSys - Paciente',
      },
      //Profissional
      {
        path: 'profissional/novo',
        component: ProfissionalAddComponent,
        pathMatch: 'full',
        title:
          'Profissionais | OdontoSys - Consulta de Profissionais',
      },
      {
        path: 'profissional/lista',
        component: ProfissionalListComponent,
        pathMatch: 'full',
        title:
          'Profissionais | OdontoSys - Cadastro de Profissional',
      },
      {
        path: 'profissional/detalhe/:id',
        component: ProfissionalDetailComponent,
        pathMatch: 'full',
        title:
          'Profissional Detalhe | OdontoSys - Profissional',
      },
      //Agendamento
      {
        path: 'agendamento',
        component: CalenderComponent,
        title: 'Agendamentos | OdontoSys - Agendamentos de pacientes'
      },
      //Convênios
      {
        path: 'convenios/lista',
        component: ConveniosListComponent,
        pathMatch: 'full',
        title: 'Convênios | OdontoSys',
      },
      //Orçamento
      {
        path: 'orcamento/lista',
        component: OrcamentoListComponent,
        pathMatch: 'full',
        title: 'Orçamentos | OdontoSys',
      },
      {
        path: 'orcamento/novo',
        component: OrcamentoAddComponent,
        pathMatch: 'full',
        title: 'Novo Orçamento | OdontoSys',
      },
      {
        path: 'orcamento/detalhe/:id',
        component: OrcamentoDetailComponent,
        pathMatch: 'full',
        title: 'Orçamento | OdontoSys',
      },
      //Financeiro
      {
        path: 'financeiro',
        component: FinanceiroListComponent,
        pathMatch: 'full',
        title: 'Financeiro | OdontoSys',
      },
      //Usuários
      {
        path: 'usuarios',
        component: UsuariosListComponent,
        pathMatch: 'full',
        title: 'Usuários | OdontoSys',
      },
      //Relatórios
      {
        path: 'relatorios',
        component: RelatoriosComponent,
        pathMatch: 'full',
        title: 'Relatórios | OdontoSys',
      },


      
      {
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
        title:
          'Angular Ecommerce Dashboard | OdontoSys - Angular Admin Dashboard Template',
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Angular Profile Dashboard | OdontoSys - Angular Admin Dashboard Template'
      },
      {
        path: 'form-elements',
        component: FormElementsComponent,
        title: 'Angular Form Elements Dashboard | OdontoSys - Angular Admin Dashboard Template'
      },
      {
        path: 'basic-tables',
        component: BasicTablesComponent,
        title: 'Angular Basic Tables Dashboard | OdontoSys - Angular Admin Dashboard Template'
      },
      {
        path: 'blank',
        component: BlankComponent,
        title: 'Angular Blank Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },

      // support tickets
      {
        path: 'invoice',
        component: InvoicesComponent,
        title: 'Angular Invoice Details Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'line-chart',
        component: LineChartComponent,
        title: 'Angular Line Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'bar-chart',
        component: BarChartComponent,
        title: 'Angular Bar Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'alerts',
        component: AlertsComponent,
        title: 'Angular Alerts Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'avatars',
        component: AvatarElementComponent,
        title: 'Angular Avatars Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'badge',
        component: BadgesComponent,
        title: 'Angular Badges Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'buttons',
        component: ButtonsComponent,
        title: 'Angular Buttons Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'images',
        component: ImagesComponent,
        title: 'Angular Images Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'videos',
        component: VideosComponent,
        title: 'Angular Videos Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
    ]
  },
  // auth pages (fora do AuthGuard)
  {
    path: 'sign-in',
    component: SignInComponent,
    title: 'Entrar | OdontoSys'
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
    title: 'Criar conta | OdontoSys'
  },
  // error pages
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Angular NotFound Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
];
