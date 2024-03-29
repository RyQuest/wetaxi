import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgxLoadingModule } from 'ngx-loading';
import { InputTrimModule } from 'ng2-trim-directive';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'
import { FileValidator } from '../helper/file-input.validator';
import { SelectModule } from 'ng-select';
import { ActionLogsRoutingModule } from './action-logs-routing.module';
import { ListActionLogsComponent } from './list-action-log/list-action-log.component';
import { ViewActionLogsComponent } from './view-action-log/view-action-log.component';

@NgModule({
  imports: [
    CommonModule,
    ActionLogsRoutingModule,
    SharedModule,
    FormsModule,
    DataTablesModule,
    NgbDropdownModule,
    NgxLoadingModule,
    InputTrimModule,
    NgbDatepickerModule,
    SelectModule
  ],
  declarations: [ ListActionLogsComponent,ViewActionLogsComponent],
  providers: [ FileValidator ]
})

export class ActionLogsModule { }
