import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ToastController, AlertController, ModalController } from '@ionic/angular';
import { HttpService } from 'src/app/services/http.service';
import { ActivatedRoute } from '@angular/router';
import { WalletComponent } from '../../blocks/wallet/wallet.component';

@Component({
    selector: 'det-trade',
    templateUrl: './trade.component.html',
    styleUrls: ['./trade.component.scss'],
})
export class TradeComponent implements OnInit {

    @Input() trade: any;
    @Input() myDetails: any;
    @Input() details: any;
    @Input() loading = true;
    @Input() referrer: any;

    @Output() doTrade = new EventEmitter();

    private editTrade = false;
    private executing = false;
    private data: any;
    private title: string;
    private description: string;
    private myTradeData: any;
    private tradeId: any;

    constructor(
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private modalCtrl: ModalController,
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

    tradeAction(action: string) {
        this.doTrade.emit(action);
    }

    async updateFields() {
        if (this.editTrade) {
            let required: any;
            if (this.referrer === 'outbox') {
                required = {
                    giving_valu: this.myTradeData.valu
                };
            }
            if (this.referrer === 'inbox') {
                required = {
                    receiving_valu_id: this.myTradeData.wallet_id,
                    receiving_valu: this.myTradeData.valu
                };
            }
            if (this.checkTrade(required)) {
                this.executing = true;
                let fields = {
                    ...required,
                    title: this.title,
                    description: this.description
                };
                if (this.referrer === 'inbox') {
                    fields = {
                        ...fields,
                        receiving_valu: this.myTradeData.valu,
                        status: 'Proposed'
                    };
                }
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
            if (!this.myTradeData.wallet_dba) {
                const modal = await this.modalCtrl.create({
                    component: WalletComponent,
                    componentProps: {modal: true},
                    cssClass: 'wallet-modal'
                });
                await modal.present();
                return await modal.onDidDismiss().then((resp) => {
                    console.log(resp);
                    if (resp.data && resp.data.amount) {
                        this.myTradeData.valu = resp.data.amount;
                        this.myTradeData.wallet_id = resp.data.wallet.wallet_id;
                        this.myTradeData.wallet_dba = resp.data.wallet.dba;
                        this.myTradeData.wallet_cap = resp.data.wallet.feathers;
                        this.myTradeData.vendor_id = resp.data.wallet.vendor_id;
                        this.updateFields();
                    }
                    this.editTrade = false;
                });
            }
        }
    }

    checkTrade(fields: any) {
        let passCheck = true;
        const keys = Object.keys(fields);
        keys.filter((key: any) => {
            passCheck = !!fields[key];
            if (key.includes('_valu') && !key.includes('_valu_id')
            && (this.myTradeData.wallet_cap < fields[key])
            && this.myTradeData.merchant_id !== this.myTradeData.vendor_id) {
                passCheck = false;
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
