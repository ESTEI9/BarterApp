import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { VarsService } from 'src/app/services/vars.service';
import { NavController, ModalController } from '@ionic/angular';
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
    private segment: string = 'queued';
    private inboxIsLoading: boolean = true;
    private outboxIsLoading: boolean = true;
    private archiveIsLoading: boolean = true;

    constructor(
        private http: HttpService,
        private vars: VarsService,
        private navCtrl: NavController,
        private modalCtrl: ModalController
    ) { }

    ngOnInit() {
        this.loadInbox();
        this.loadOutbox();
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
        }, (err: any) => {
            console.log("There was an error");
        });
        this.inboxIsLoading = false;
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
        }, (err: any) => {
            console.log("There was an error");
        });
        this.outboxIsLoading = false;
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
        }, (err: any) => {
            console.log('There was an error');
        })
        this.archiveIsLoading = false;
    }

    switchSegment(event: any) {
        this.segment = event.detail.value;

        if (this.segment == 'queued') {
            this.loadInbox();
            this.loadOutbox();
        } else {
            this.loadArchive();
        }
    }

    async startNewTrade(){
        const modal = await this.modalCtrl.create({
            component: NewTradeComponent
        });
        await modal.present();
        let newTrade = await modal.onDidDismiss();
        console.log(newTrade);
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
