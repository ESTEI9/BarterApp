import { Component, OnInit } from '@angular/core';
import { NavController, MenuController, ActionSheetController, ModalController } from '@ionic/angular';
import { NewTradeComponent } from 'src/app/components/new-trade/new-trade.component';

@Component({
    selector: 'app-inbox',
    templateUrl: './inbox.page.html',
    styleUrls: ['./inbox.page.scss'],
})
export class InboxPage implements OnInit {

    private segment = 'trades';
    private tradeType: string;

    constructor(
        private navCtrl: NavController,
        private menuCtrl: MenuController,
        private actionSheetCtrl: ActionSheetController,
        private modalCtrl: ModalController
    ) {
        this.menuCtrl.enable(true, 'primary');
    }

    ngOnInit() { }

    switchSegment(event: any) {
        this.segment = event.detail.value;
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
                    componentProps: {tradeType: this.tradeType}
                });
                await modal.present();
            }
        });
    }

}
