import { Component, OnInit } from '@angular/core';
import { NavController, ActionSheetController, ModalController } from '@ionic/angular';
import { NewTradeComponent } from 'src/app/components/new-trade/new-trade.component';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
    selector: 'app-archives',
    templateUrl: './archives.page.html',
    styleUrls: ['./archives.page.scss'],
})
export class ArchivesPage implements OnInit {

    private segment = 'trades';
    private tradeType: string;
    private trades: any;
    private invoices: any;
    private gifts: any;

    constructor(
        private navCtrl: NavController,
        private actionSheetCtrl: ActionSheetController,
        private modalCtrl: ModalController,
        private vars: VarsService,
        private http: HttpService
    ) { }

    ngOnInit() {
        this.vars.loading = true;
        this.loadArchives().then(() => {
            this.vars.loading = false;
        });
    }

    switchSegment(event: any) {
        this.segment = event.detail.value;
    }

    loadArchives() {
        return new Promise(resolve => {
            const body = {
                segment: 'archives',
                merchantID: this.vars.merchantData.merchant_id
            };
            this.http.getData('tradehub', body).subscribe((resp: any) => {
                if (resp.status === 1) {
                    this.trades = resp.data.trades || [];
                    this.invoices = resp.data.invoices || [];
                    this.gifts = resp.data.gifts || [];
                } else {
                    console.log(resp);
                }
                resolve();
            }, (err) => {
                console.log(err);
                resolve();
            });
        });
    }

    updateType(data: any) {
        switch (this.segment) {
            case 'trades':
                this.trades = data;
                break;
            case 'invoices':
                this.invoices = data;
                break;
            case 'gifts':
                this.gifts = data;
                break;
        }
    }

    async startNewTrade() {
        this.tradeType = '';
        const sheet = await this.actionSheetCtrl.create({
            header: 'Select Trade Type',
            buttons: [{
                text: 'Trade',
                handler: () => {
                    this.tradeType = 'Trade';
                }
            }, {
                text: 'Invoice',
                handler: () => {
                    this.tradeType = 'Invoice';
                }
            }, {
                text: 'Gift',
                handler: () => {
                    this.tradeType = 'Gift';
                }
            }, {
                text: 'Cancel',
                role: 'cancel'
            }]
        });
        await sheet.present();
        await sheet.onDidDismiss().then(async () => {
            if (this.tradeType) {
                const modal = await this.modalCtrl.create({
                    component: NewTradeComponent,
                    componentProps: { tradeType: this.tradeType }
                });
                await modal.present();
                modal.onDidDismiss().then(() => {
                    this.loadArchives();
                });
            }
        });
    }

}
