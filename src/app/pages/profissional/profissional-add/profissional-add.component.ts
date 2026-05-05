import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-profissional-add',
  imports: [CommonModule, PageBreadcrumbComponent,],
  templateUrl: './profissional-add.component.html',
  styleUrl: './profissional-add.component.css'
})
export class ProfissionalAddComponent {

}


