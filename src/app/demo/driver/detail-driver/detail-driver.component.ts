import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { DriverService, AuthService } from '../../services';
import { ToastData, ToastOptions, ToastyService } from 'ng2-toasty';
// import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { SettingService } from '../../services/setting.service';
import { ExcelService } from '../../services/excel.service';
import { NgbDatepickerConfig, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators } from '@angular/forms';
import { LocationService } from '../../services/location.service';
import { environment } from 'src/environments/environment';
import { MouseEvent } from '@agm/core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';


@Component({
  selector: 'detail-driver',
  templateUrl: './detail-driver.component.html'
})
export class DetailDriverComponent implements  OnInit {
  driverDetails: any;
  profilePhotoUrl: string;
  title = 'appBootstrap';
   //google maps zoom
   zoom: Number = 14;

   //Get Directions
     dir = undefined;
     
  closeResult: string;
  public loading = false;
  public primaryColour = "#ffffff";
  public secondaryColour = "#ffffff";
  position = 'bottom-right';
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  promotions;
  submitted = false;
  filterForm = this.fb.group({
    fromDate: ['', Validators.required],
    toDate: ['', Validators.required]
  });
  public destination_lat:any;
  public destination_long:any;
  public sourec_lat:any;
  public sourec_long:any;

  filterValue: any = {};
  getPromotionListExcel: [];
  exportActionLogExcel: any[];
  driverTrips: any;
  exportDriverExcel=[];
  getAllDriverLocationPDF: any;
  latCordinate: any;
      
      constructor(
    private driverService: DriverService,
        
      private locationService: LocationService ,
      private toastyService: ToastyService,
    private authService: AuthService,
    private fb: FormBuilder,
    config: NgbDatepickerConfig,
    private modalService: NgbModal,
    private excelService: ExcelService)
    {
      config.minDate = { year: 1900, month: 1, day: 1 };
      config.maxDate = { year: (new Date()).getFullYear(), month: (new Date()).getMonth() + 1, day: (new Date()).getDate() };
    }
    open(content) {
      this.destination_lat=content._parentView.oldValues[8]
       this.destination_long=content._parentView.oldValues[9]
       this.sourec_lat=content._parentView.oldValues[10]
      this.sourec_long=content._parentView.oldValues[11]
      // console.log("this.sourec_lat",typeof(this.sourec_lat))
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title',size: <any>'xl'}).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        // console.log("test");
      });
      this.getDirection();
    }
    
    private getDismissReason(reason: any): string {
      if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
      } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
      } else {
        return  `with: ${reason}`;
      }
    }

    public getDirection() {
      this.dir = {
        origin: { lat: this.sourec_long, lng: this.sourec_lat },
        destination: { lat: this.destination_long, lng: this.destination_lat }
      }
    //   this.dir = {
    //     origin: { lat: 23.054781, lng: 72.499937 },
    //    destination: { lat: 23.218957, lng: 72.636019 }
    //  }

    }


getPdfData(){
  this.loading = true;
  let url = window.location.href.split("/")
  let url_id = url[url.length-1];
  let recycled = {
    'driverId': url_id
  }
  this.locationService.getTripsByDriverIdPDF(recycled).subscribe(
    respone => {
      this.getAllDriverLocationPDF = respone.data;
      this.generatePdf();
    },
    error => {
      this.loading = false;
      this.addToast({ title: 'Error', msg: error.message, timeout: 5000, theme: 'default', position: 'bottom-right', type: 'error' });
    }
  );
}
  generatePdf(){
    const downloadPDF = new jsPDF();
    const header = [['Trip Id', 'Name', 'Phone','Distance','Duration', 'Amount(KHR)', 'Paid by', 'Driver Earning(KHR)']];
    const rows=[];
    const data = this.getAllDriverLocationPDF;
    if(data.length > 0){
      data.forEach(element => {
        const temp = [
          element.rideId,
          element.vehicleTypeData.type.en,
          element.driverData.onlyPhoneNumber,
          element.totalDistance ,
          element.totalTime,
          element.totalFare,
          element.paidBy,
          element.driverEarning 
        ];
        rows.push(temp);
      });
    }  else {
        this.loading = false;
        this.addToast({ title: 'Error', msg: "No data found", timeout: 5000, theme: 'default', position: 'bottom-right', type: 'error' });
      return;
    }
    //  @ts-ignore
    downloadPDF.autoTable({
      head: header,
      body: rows,
    });
    this.loading = false;
    downloadPDF.save('Driver-Details-data.pdf');
  }
    exportAsExcel(){
    
      this.loading = true;
      let url = window.location.href.split("/")
      let url_id = url[url.length-1];
      let recycled = {
        'driverId': url_id
      }
       
      this.locationService.getTripsByDriverIdPdf(recycled).subscribe(
        resp => {
          console.log( "dsadsdas",resp.data.RideDetail)
          resp.data.RideDetail.map(element => {
            this.exportDriverExcel.push({
              'Trip Id': element.rideId,
              'Name': element.vehicleTypeData.type.en,
              'Phone': element.driverData.onlyPhoneNumber,
              'Distance': element.totalDistance ,
              'Duration': element.totalTime,
              'Amount(KHR)': element.totalFare,
              'Paid By': element.paidBy,
              'Driver Earning(KHR)': element.driverEarning
            })
          });
          this.loading = false;
  
          this.excelService.exportAsExcelFile(this.exportDriverExcel, 'DriverRideData '+this.driverDetails.name);
          this.exportDriverExcel =[];
        },
        error => {
          this.loading = false;
          this.addToast({ title: 'Error', msg: error.message, timeout: 5000, theme: 'default', position: 'bottom-right', type: 'error' });
        }
      );
    }


      getDriverDetails(id){
        let recycled = {
          'id': id
          }
        // console.log("recycled",recycled)
        this.locationService
        .getDriverLocationById(recycled)
        .subscribe(respone => {
          this.driverDetails = respone.data.DriverLocationDetail[0];
      
          // console.log("driverDetails--------------------------", this.driverDetails);
      
        });
      }
      
  
      imgErrorHandler(event) {
        event.target.src = '/assets/images/profile-dummy.png';
        // event.target.src = this.profilePhotoUrl + 'default.png';
      }
    ngOnInit(){
      // this.getDirection();
      this.profilePhotoUrl = environment.profileImageUrl;
      let url = window.location.href.split("/")
      let url_id = url[url.length-1];
      // console.log("url ",url)
      // console.log("id ",url_id)
      this.getDriverDetails(url_id);

      this.authService.clearDataTableData("DataTables_component");
      this.loading = true;
      this.dtOptions = {
        pagingType: "full_numbers",
        pageLength: 10,
        order: [0, 'desc'],
        serverSide: true,
        processing: true,
        stateSave: true,
       
        stateSaveCallback: function (settings, data) {
          localStorage.setItem(
            "DataTables_component",
            JSON.stringify(data)
          );
        }, 
        stateLoadCallback: function (settings) {
          return JSON.parse(localStorage.getItem("DataTables_component"));
        },
        
        ajax: (dataTablesParameters: any, callback) => {
          let url = window.location.href.split("/")
          let url_id = url[url.length-1];
          // console.log(dataTablesParameters);
          dataTablesParameters.search.value = dataTablesParameters.search.value.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
          dataTablesParameters.filter = this.filterValue;
          dataTablesParameters.driverId = url_id;

          // console.log("dataTablesParameters",dataTablesParameters);
          
          this.locationService.getTripsByDriverId(dataTablesParameters).subscribe(
            resp => {
              this.loading = false;
              this.driverTrips = resp.data.RideDetail;
              this.latCordinate = resp.data.RideDetail;
              var inputs = document.getElementsByTagName('input');

          for(var i = 0; i < inputs.length; i++) {
            if(inputs[i].type.toLowerCase() == 'search') {
              inputs[i].style.width = 15 + "vw";
              inputs[i].style.minWidth = 150 + "px";
            }
          }

            //  console.log("this.driverTrips",this.latCordinate)
            //  console.log("resp.data.length",resp.data.length)

              callback({
                recordsTotal: resp.data.RideDetail.length, 
                recordsFiltered: resp.data.RideDetail.length,
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
          // {data:null},
          { data: "rideId"},
          { data: "driverData.profilePhoto",orderable: false, searchable: false},
          { data: "vehicleTypeData.type.en"},
          { data: "driverData.onlyPhoneNumber"},
          { data: "totalDistance"},
          { data: "totalTime", searchable: false},
          { data: "totalFare", searchable: false},
          {data:"paidBy"},
         
          { data: "driverEarning"},
          {data: "TrackLocation",orderable:false,searchable:false},
         
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
