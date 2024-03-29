import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { OperatorService, AuthService } from '../../services';
import { ToastData, ToastOptions, ToastyService } from 'ng2-toasty';
import Swal from 'sweetalert2';

class Operator {
  first_name: string;
  last_name: string;
  email: string;
  isActive: string;
}

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: 'list-vehicle-owner',
  templateUrl: './list-vehicle-owner.component.html'
})
export class ListVehicleOwnerComponent implements AfterViewInit, OnInit {

  public loading = false;
  public primaryColour = "#ffffff";
  public secondaryColour = "#ffffff";
  position = 'bottom-right';
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  operators;
  userType: any;

  constructor(
    private operatorService: OperatorService,
    private authService: AuthService,
    private toastyService: ToastyService
  ) { }
  userData() {
    let adminData = JSON.parse(localStorage.getItem("adminData"));
    this.userType = adminData.type;
    // console.log("adminData", this.userType);
  }
  ngOnInit() {
    this.userData();
    this.loading = true;
    this.authService.clearDataTableData("DataTables_operator_management");
  
      this.dtOptions = {
        pagingType: "full_numbers",
        pageLength: 10,
        serverSide: true,
        processing: false,
        stateSave: true,
        stateSaveCallback: function (settings, data) {
          localStorage.setItem(
            "DataTables_operator_management",
            JSON.stringify(data)
          );
        },
        stateLoadCallback: function (settings) {
          return JSON.parse(localStorage.getItem("DataTables_operator_management"));
        },
        ajax: (dataTablesParameters: any, callback) => {
          dataTablesParameters.search.value = dataTablesParameters.search.value.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
          // console.log(this.userType);
          var inputs = document.getElementsByTagName('input');
              for(var i = 0; i < inputs.length; i++) {
                if(inputs[i].type.toLowerCase() == 'search') {
                  inputs[i].style.width = 15 + "vw";
                inputs[i].style.minWidth = 150 + "px";
                }
              }
          if(this.userType==="admin"){
          this.operatorService.listAllVehicleOwner(dataTablesParameters).subscribe(
            resp => {
              this.loading = false;
              this.operators = resp.data[0].vehicleOwnerList;              
              // this.operators.map(element => {
              //   if (element.canChangePassword) {
              //     element.isCheck = true;
              //   } else {
              //     element.isCheck = false;
              //   }
              // });
              callback({
                recordsTotal: resp.data[0].fullCount,
                recordsFiltered: resp.data[0].vehicleOwnerCount[0]?resp.data[0].vehicleOwnerCount[0].filterCount:0,
                data: []
              });
            },
            error => {
              this.loading = false;
              this.addToast({ title: 'Error', msg: error.message, timeout: 5000, theme: 'default', position: 'bottom-right', type: 'error' });
            }
          );
          }
          if(this.userType==="promoter"){
            this.operatorService.listAllVehicleOwner(dataTablesParameters).subscribe(
              resp => {
                console.log("resp",resp)
                this.loading = false;
                this.operators = resp.data[0].vehicleOwnerList;
                callback({
                  recordsTotal: resp.data[0].fullCount,
                  recordsFiltered: resp.data[0].vehicleOwnerCount[0]?resp.data[0].vehicleOwnerCount[0].filterCount:0,
                  data: []
                });
              },
              error => {
                this.loading = false;
                this.addToast({ title: 'Error', msg: error.message, timeout: 5000, theme: 'default', position: 'bottom-right', type: 'error' });
              }
            );
            }
        },
        columns: [
          // { data: "permission_allow", orderable: false, searchable: false },
          { data: "autoIncrementID" },
          { data: "name" },
          {data:"userCommission"},
          { data: "email" },
          { data: "phoneNumber" },
          { data: "dob" },
          { data: "isActive",orderable: false, searchable: false },
          { data: "actions", orderable: false, searchable: false }
        ]
      };
    
   
    
 
   }

  addToast(options) {
    if (options.closeOther) {
      this.toastyService.clearAll();
    }
    this.position = options.position ? options.position : this.position;
    const toastOptions: ToastOptions = {
      title: options.title,
      msg: options.msg,
      showClose: options.showClose,
      timeout: options.timeout,
      theme: options.theme,
      onAdd: (toast: ToastData) => {
      },
      onRemove: (toast: ToastData) => {
      }
    };

    switch (options.type) {
      case 'default': this.toastyService.default(toastOptions); break;
      case 'info': this.toastyService.info(toastOptions); break;
      case 'success': this.toastyService.success(toastOptions); break;
      case 'wait': this.toastyService.wait(toastOptions); break;
      case 'error': this.toastyService.error(toastOptions); break;
      case 'warning': this.toastyService.warning(toastOptions); break;
    }
  }

  // isAllSelected(id,status) {
  //   this.operatorService.changePasswordStatus({operator_id:id,change_password:status}).subscribe(
  //     next => {
  //       this.rerender();
  //       if (next.status == 200) {
  //         this.addToast({ title: 'Success', msg: next.message, timeout: 5000, theme: 'default', position: 'bottom-right', type: 'success' });
  //       } else {
  //         this.addToast({ title: 'Error', msg: next.message, timeout: 5000, theme: 'default', position: 'bottom-right', type: 'error' });
  //       }
  //     },
  //     error => {
  //       this.addToast({ title: 'Error', msg: error.message, timeout: 5000, theme: 'default', position: 'bottom-right', type: 'error' });
  //     });
  // }

  activeInactiveOperator(operator: any) {
    let text;
    if (operator.isActive) {
      text = 'You want to inactive this Vehicle Owner ?';
    } else {
      text = 'You want to active this Vehicle Owner ?';
    }

    Swal({
      title: 'Are you sure?',
      text: text,
      type: 'warning',
      showCloseButton: true,
      showCancelButton: true
    }).then((willDelete) => {
      if (willDelete && !willDelete.dismiss) {
        let data = {
          'id': operator._id
        }
        this.operatorService.activeInactiveOperator(data).subscribe(
          next => {
            if (next.status_code == 200) {
              this.rerender();
              if (operator.isActive) {
                Swal('Success', "Vehicle Owner inactivated successfully.", 'success');
              } else {
                Swal('Success', "Vehicle Owner activated successfully.", 'success');
              }
            } else {
              Swal('Error', "Vehicle Owner status is not updated.", 'error');
            }
          },
          error => {
            Swal('Error', "Vehicle Owner status is not updated.", 'error');
          }
        );
      } else { }
    });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

}
