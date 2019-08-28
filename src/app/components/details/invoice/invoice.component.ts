import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { HttpService } from 'src/app/services/http.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'det-invoice',
    templateUrl: './invoice.component.html',
    styleUrls: ['./invoice.component.scss'],
})
export class InvoiceComponent implements OnInit {

    @Input() trade: any;
    @Input() myDetails: any;
    @Input() details: any;
    @Input() loading: boolean;
    @Input() referrer: any;

    private editTrade = false;
    private executing = false;
    private data: any;
    private title: string;
    private description: string;
    private myTradeData: any;
    private tradeId: any;

    @Output() doTrade = new EventEmitter();

    constructor(
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private http: HttpService,
        private route: ActivatedRoute
    ) {
        this.tradeId = this.route.snapshot.params.id;
    }

    ngOnInit() {
        this.loading = false;
        this.data = {...this.trade};
        this.title = this.data.tradeData.title;
        this.description = this.data.tradeData.description;
        this.myTradeData = {...this.myDetails};
    }

    tradeAction(event: string) {
        this.doTrade.emit(event);
    }

    async updateFields() {
        if (this.editTrade) {
            const required = {
                receiving_valu: this.details.valu
            };
            if (this.checkTrade(required)) {
                this.executing = true;
                const fields = {
                    ...required,
                    title: this.title,
                    description: this.description
                };
                this.updateTrade(fields).then(() => {
                    this.editTrade = false;
                    this.executing = false;
                });
            } else {
                const alert = await this.alertCtrl.create({
                    header: 'Incorrect Fields',
                    message: 'Please validate all fields.',
                    buttons: [{text: 'OK'}]
                });
                await alert.present();
            }
        } else {
            this.editTrade = true;
        }
    }

    checkTrade(fields: any) {
        let passCheck = true;
        const keys = Object.keys(fields);
        keys.filter((key: any) => {
            passCheck = !!fields[key];
            if (key.includes('_valu') && this.referrer === 'inbox') {
                if (
                    this.myDetails.wallet_cap < fields[key]
                    && this.myDetails.merchant_id !== this.myDetails.vendor_id
                ) {
                    passCheck = false;
                }
            }
        });
        return passCheck;
    }

    async updateTrade(fields: any) {
        const body = {
            action: 'update',
            tradeId: this.tradeId,
            ...fields
        };
        this.http.postData('details', {body: JSON.stringify(body)}).subscribe(async (resp: any) => {
            if (resp.status !== 1) {
                const toast = await this.toastCtrl.create({
                    message: 'Unable to update trade',
                    duration: 3000,
                    color: 'dark'
                });
                await toast.present();
            }
        });
    }

}
