import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NavController } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
    selector: 'seg-invoices',
    templateUrl: './invoices.component.html',
    styleUrls: ['./invoices.component.scss'],
})
export class InvoicesComponent implements OnInit {

    @Input('segment') segment: string;
    
    private initLoading = true;
    private invoices: any;

    constructor(
        private navCtrl: NavController,
        private vars: VarsService,
        private http: HttpService
    ) { }

    ngOnInit() {
        this.loadInvoices().then(() => {
            this.initLoading = false;
        });
    }

    viewTrade(id: any) {
        this.navCtrl.navigateForward('/details/' + id);
    }

    async loadInvoices() {
        const body = {
            merchantID: this.vars.merchantData['merchant_id'],
            type: 'Invoice',
            segment: this.segment
        };
        await this.http.getData('tradehub', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                this.invoices = resp.data.invoices;
            } else {
                console.log(resp);
            }
        }, (err: any) => {
            console.log(err);
        });
    }

}
