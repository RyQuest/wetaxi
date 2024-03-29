import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { PassengerService, AuthService, DriverService } from '../../services';
import { RefferalHierarchyService } from '../../services/refferal-hierarchy.service';
import { ToastData, ToastOptions, ToastyService } from 'ng2-toasty';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { ExcelService } from '../../services/excel.service';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
class Passenger {
  uniqueID: string;
  Email: string;
  name: string;
  phone_number: string;
  dob: string;
}

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Component({
  selector: 'app-passenger-hierarchy',
  templateUrl: './passenger-hierarchy.component.html'
})
export class PassengerHierarchyComponent implements OnInit {


  public loading = false;
  public primaryColour = "#ffffff";
  public secondaryColour = "#ffffff";
  position = 'bottom-right';
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  passengers;
  exportPassengerExcel = [];
  profilePhotoUrl: any;
  submitted = false;
  filterForm = this.fb.group({
    fromDate: ['', Validators.required],
    toDate: ['', Validators.required]
  });
  filterValue: any = {};
  getPdfData: any;
  exportExcel=[];

  constructor(
    private passengerService: PassengerService,
    private refferalHierarchyService: RefferalHierarchyService,
    private toastyService: ToastyService,
    private authService: AuthService,
    private driverService:DriverService,

    private fb: FormBuilder,
    private excelService: ExcelService,
    config: NgbDatepickerConfig,
  ) {
    config.minDate = { year: 1900, month: 1, day: 1 };
    config.maxDate = { year: (new Date()).getFullYear(), month: (new Date()).getMonth() + 1, day: (new Date()).getDate() };
  }

  ngOnInit() {
    this.profilePhotoUrl = environment.profileImageUrl;
    this.authService.clearDataTableData("DataTables_passenger_management");
    this.loading = true;
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      order: [0, 'desc'],
      serverSide: true,
      processing: false,
      stateSave: true,
      stateSaveCallback: function (settings, data) {
        localStorage.setItem(
          "DataTables_passenger_management",
          JSON.stringify(data)
        );
      },
      stateLoadCallback: function (settings) {
        return JSON.parse(localStorage.getItem("DataTables_passenger_management"));
      },
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.search.value = dataTablesParameters.search.value.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
        dataTablesParameters.filter = this.filterValue;
        this.refferalHierarchyService.ListAllPassengerReferrals(dataTablesParameters).subscribe(
          resp => {
            this.loading = false;
            this.passengers = resp.data;
            var inputs = document.getElementsByTagName('input');
            for(var i = 0; i < inputs.length; i++) {
              if(inputs[i].type.toLowerCase() == 'search') {
                inputs[i].style.width = 15 + "vw";
                inputs[i].style.minWidth = 150 + "px";
              }
            }
            for (let index = 0; index < this.passengers.length; index++) {
              if (moment().format('D') == moment(this.passengers[index].dob).format('D') && moment().format('MMMM') == moment(this.passengers[index].dob).format('MMMM')) {
                this.passengers[index].isSelected = true;
              } else {
                this.passengers[index].isSelected = false;
              }
            }
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: []
            });
          },
          error => {
            this.loading = false;
            this.addToast({ title: 'Error', msg: error.message, timeout: 5000, theme: 'default', position: 'bottom-right', type: 'error' });
          }
        );
      },
      columns: [
        { data: "autoIncrementID" },
        { data: "uniqueID", orderable: false },
        { data: "profilePhoto", orderable: false },

        { data: "name" },
        { data: "onlyPhoneNumber" },
        { data: null, orderable: false, searchable: false },
        { data: null, orderable: false, searchable: false },
        { data: null, orderable: false, searchable: false },
        { data: null, orderable: false, searchable: false },

        
        { data: "createdAt", searchable: false },
        { data: "totalInvitedCount", orderable: false, searchable: false },
      
        { data: "actions", orderable: false, searchable: false }
      ]
    };
  }
  generatePdf() 
  { 
// import 'jspdf-autotable';

   this.loading = true;
   this.driverService.getAllDriverPDF().subscribe(
     respone => {
     
       this.getPdfData = respone.data;
      //  this.jsonObj = respone.data;
       console.log("getPdfData",this.getPdfData)
     //  this.data();
      this.exportDriverDataToPdf();
      
     },
     
     error => {
       this.loading = false;
       this.addToast({ title: 'Error', msg: error.message, timeout: 5000, theme: 'default', position: 'bottom-right', type: 'error' });
     }
   );
  
  } 

 exportDriverDataToPdf(){

const downloadPDF = new jsPDF();
const header = [['autoIncrementID', 'uniqueID', 'name', 'PhoneNumber', 'creditBalance', 'totalRideEarning', 'createdAt']];
const rows=[];
  

       const data = this.getPdfData;
       console.log("data",data)
      
     
       data.forEach(elm => {
          const temp = [elm.autoIncrementID, elm.uniqueID,elm.name,elm.onlyPhoneNumber,elm.creditBalance,elm.totalRideEarning,elm.createdAt  ];
          rows.push(temp);
         //  console.log('Rows', rows); // showing all data
        });

       //  @ts-ignore
       downloadPDF.autoTable({
         head: header,
         body: rows,
       });
     
       this.loading = false;

       downloadPDF.save('Driver data.pdf');

  }

 
  exportExcelData() {
    console.log("log")
    this.loading = true;

    this.refferalHierarchyService.ListAllPassengerReferrals({}).subscribe(
      resp => {
        // console.log("log", resp.data.AllDriverLocation)

        resp.data.map(element => {
          this.exportExcel.push({ 'uniqueID': element.uniqueID, 'name': element.name, 'onlyPhoneNumber': element.onlyPhoneNumber, 'creditBalance': element.creditBalance,'totalInvitedCount': element.totalInvitedCount })
        
      
        });
    this.loading = false;

        this.excelService.exportAsExcelFile(this.exportExcel, 'Passenger-hierarchy');

          this.exportExcel =[];
      },
      error => {
        this.loading = false;
        this.addToast({ title: 'Error', msg: error.message, timeout: 5000, theme: 'default', position: 'bottom-right', type: 'error' });
      }
    );
  }


  imgErrorHandler(event) {
    event.target.src = this.profilePhotoUrl + 'default.png';
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

  blockUnblockPassenger(passenger: any) {
    let text;
    if (passenger.isBlocked) {
      text = 'You want to unblock this passenger ?';
    } else {
      text = 'You want to block this passenger ?';
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
          'passenger_id': passenger._id
        }
        this.passengerService.blockUnblockPassenger(data).subscribe(
          next => {
            if (next.status_code == 200) {
              this.rerender();
              if (passenger.isBlocked) {
                Swal('Success', "Passenger unblocked successfully.", 'success');
              } else {
                Swal('Success', "Passenger blocked successfully.", 'success');
              }
            } else {
              Swal('Error', next.message, 'error');
            }
          },
          error => {
            Swal('Error', error.message, 'error');
          }
        );
      } else {

      }
    });
  }

  levelnotfound() {
    Swal({
      title: 'Bottom line !!',
      // text: 'Passenger next level not found',
      type: 'info',
      showCloseButton: true,
      showCancelButton: false
    }).then((willDelete) => {
      
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

  filterList() {
    this.submitted = true;

    if (this.filterForm.status == "INVALID")
      return;

    let { fromDate, toDate } = this.filterForm.value;

    this.filterValue = {
      fromDate: moment().year(fromDate.year).month(fromDate.month - 1).date(fromDate.day).hours(0).minutes(0).seconds(0).milliseconds(0).toISOString(),
      toDate: moment().year(toDate.year).month(toDate.month - 1).date(toDate.day).hours(23).minutes(59).seconds(59).milliseconds(999).toISOString()
    };

    this.rerender();
  }

  resetFilter() {
    this.submitted = false;
    this.filterValue = {}
    this.filterForm.reset();
    this.rerender();
  }
}
