import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-profissional-list',
  imports: [CommonModule, PageBreadcrumbComponent,],
  templateUrl: './profissional-list.component.html',
  styleUrl: './profissional-list.component.css'
})
export class ProfissionalListComponent {

}


