import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-profissional-detail',
  imports: [CommonModule, PageBreadcrumbComponent,],
  templateUrl: './profissional-detail.component.html',
  styleUrl: './profissional-detail.component.css'
})
export class ProfissionalDetailComponent {

}


