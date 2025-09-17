import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-profissional',
  imports: [CommonModule, PageBreadcrumbComponent,],
  templateUrl: './profissional.component.html',
  styleUrl: './profissional.component.css'
})
export class ProfissionalComponent {

}


