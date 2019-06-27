import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChange } from '@angular/core';
import { NavController } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';

@Component({
    selector: 'seg-invoices',
    templateUrl: './invoices.component.html',
    styleUrls: ['./invoices.component.scss'],
})
export class InvoicesComponent implements OnInit {

    @Input('invoices') invoices: any;
    @Input('segment') segment: string;
    @Input('loading') loading: boolean;
    @Output('getInvoices') getInvoices = new EventEmitter<any>();

    constructor(
        private navCtrl: NavController,
        private vars: VarsService
    ) { }

    ngOnInit() {
        this.loading = false;
    }

    ngOnChanges(changes: {[loading: string]: SimpleChange}) {
        if(changes.loading){
            this.loading = changes.loading.currentValue;
        }
    }

    viewTrade(id: any) {
        this.navCtrl.navigateForward('/details/' + id);
    }

    loadInvoices(){
        this.loading = true;
        this.getInvoices.emit(true);
    }

}
