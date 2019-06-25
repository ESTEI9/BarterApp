import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { VarsService } from 'src/app/services/vars.service';
import { NavController, ModalController, ActionSheetController } from '@ionic/angular';
import { NewTradeComponent } from 'src/app/components/new-trade/new-trade.component';

@Component({
    selector: 'app-trade-hub',
    templateUrl: './trade-hub.page.html',
    styleUrls: ['./trade-hub.page.scss'],
})
export class TradeHubPage implements OnInit {

    private inbox: any = [];
    private outbox: any = [];
    private archive: any = [];
    private segment: string = 'inbox';
    private inboxIsLoading: boolean = true;
    private outboxIsLoading: boolean = true;
    private archiveIsLoading: boolean = true;
    private tradeType: string;

    constructor(
        private http: HttpService,
        private vars: VarsService,
        private navCtrl: NavController,
        private modalCtrl: ModalController,
        private actionSheetCtrl: ActionSheetController
    ) { }

    ngOnInit() {
        this.loadInbox();
        this.loadOutbox();
        this.loadArchive();
    }

    async loadInbox() {
        this.inboxIsLoading = true;
        const body = {
            action: 'getInbox',
            merchantID: this.vars.merchantData['merchant_id']
        };
        await this.http.getData('tradehub', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                this.inbox = resp.data;
            } else {
                console.log(resp);
            }
            this.inboxIsLoading = false;
        }, (err: any) => {
            console.log("There was an error");
            this.inboxIsLoading = false;
        });
    }

    async loadOutbox() {
        this.outboxIsLoading = true;
        const body = {
            action: 'getOutbox',
            merchantID: this.vars.merchantData['merchant_id']
        };
        await this.http.getData('tradehub', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                this.outbox = resp.data;
            } else {
                console.log(resp);
            }
            this.outboxIsLoading = false;
        }, (err: any) => {
            console.log("There was an error");
            this.outboxIsLoading = false;
        });
    }

    async loadArchive() {
        this.archiveIsLoading = true;
        const body = {
            action: 'getArchive',
            merchantID: this.vars.merchantData['merchant_id']
        };
        await this.http.getData('tradehub', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                this.archive = resp.data;
            } else {
                console.log(resp);
            }
            this.archiveIsLoading = false;
        }, (err: any) => {
            console.log('There was an error');
            this.archiveIsLoading = false;
        })
    }

    switchSegment(event: any) {
        this.segment = event.detail.value;
        switch(this.segment){
            case 'inbox':
                this.loadInbox();
                break;
            case 'outbox':
                this.loadOutbox();
                break;
            case 'archive':
                this.loadArchive();
                break;
            default:
                null;
        }
    }

    async startNewTrade(){
        this.tradeType = '';
        const sheet = await this.actionSheetCtrl.create({
            header: 'Select Trade Type',
            buttons:[{
                text: 'Trade',
                handler: () => {
                    this.tradeType = 'Trade';
                }
            }, {
                text: 'Invoice',
                handler: () => {
                    this.tradeType = 'Invoice'
                }
            }, {
                text: 'Gift',
                handler: () => {
                    this.tradeType = 'Gift'
                }
            }, {
                text: 'Cancel',
                role: 'cancel'
            }]
        })
        await sheet.present();
        await sheet.onDidDismiss().then(async () => {
            if(this.tradeType){
                const modal = await this.modalCtrl.create({
                    component: NewTradeComponent,
                    componentProps: {tradeType: this.tradeType}
                });
                await modal.present();
                await modal.onDidDismiss().then(()=>{
                    this.loadOutbox();
                });
            }
        });
    }

    viewTrade(id:any){
        this.navCtrl.navigateForward('/details/'+id);
    }

    finalizeTrade(action: string, id:any){
        const body = {
            action: action,
            id: id
        };
        this.http.postData('tradehub', body).subscribe((resp:any) => {
            if(resp.status === 1){
                this.inbox = this.inbox.filter((trade:any) => {
                    if(trade.trade_id != id){
                        return trade;
                    }
                })
            } else {
                console.log(resp);
            }
        }, (err: any) => {
            console.log("There was an error");
        })
    }

}
