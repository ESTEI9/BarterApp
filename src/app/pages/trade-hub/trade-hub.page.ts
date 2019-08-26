import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
    private isLoading: boolean = true;
    private tradeLoading: boolean = false;
    private invoiceLoading: boolean = false;
    private giftLoading: boolean = false;
    private tradeType: string;
    private inboxType: string = 'Trade';
    private outboxType: string = 'Trade';
    private archiveType: string = 'Trade';

    constructor(
        private http: HttpService,
        private vars: VarsService,
        private navCtrl: NavController,
        private modalCtrl: ModalController,
        private actionSheetCtrl: ActionSheetController
    ) { }

    ngOnInit() {
    }

    // Need to loadSegment after details page dismisses (ngAfterViewChecked crashes the app)

    async loadTypeMenu(){
        const action = await this.actionSheetCtrl.create({
            header: 'Select Type',
            buttons: [{
                text: 'Trade',
                handler: () => {
                    this.isLoading = true;
                    switch(this.segment){
                        case 'inbox':
                            this.inboxType = "Trade";
                            break;
                        case 'outbox':
                            this.outboxType = "Trade";
                            break;
                        case 'archive':
                            this.archiveType = "Trade";
                    }
                }
            },{
                text: 'Invoice',
                handler: () => {
                    this.isLoading = true;
                    switch(this.segment){
                        case 'inbox':
                            this.inboxType = "Invoice";
                            break;
                        case 'outbox':
                            this.outboxType = "Invoice";
                            break;
                        case 'archive':
                            this.archiveType = "Invoice";
                    }
                }
            },{
                text: 'Gift',
                handler: () => {
                    this.isLoading = true;
                    switch(this.segment){
                        case 'inbox':
                            this.inboxType = "Gift";
                            break;
                        case 'outbox':
                            this.outboxType = "Gift";
                            break;
                        case 'archive':
                            this.archiveType = "Gift";
                    }
                }
            },{
                text: 'Cancel',
                role: 'cancel'
            }]
        });
        await action.present();
        await action.onDidDismiss().then(()=>{
            this.isLoading = true;
            this.loadSegment();
        });
    }

    updateSegment(data: any) {
        const key = Object.keys(data)[0];
        let box: string;
        switch (this.segment) {
            case 'inbox':
                box = this.inbox;
                break;
            case 'outbox':
                box = this.outbox;
                break;
            case 'archive':
                box = this.archive;
                break;
        }
        box[key] = data[key];
    }

    async loadSegment(event?: any) {
        const boxType = (() => {
            switch (this.segment) {
                case 'inbox':
                    return this.inboxType;
                case 'outbox':
                    return this.outboxType;
                case 'archive':
                    return this.archiveType;
                default:
                    return null;
        }}).call(this);
        const body = {
            merchantID: this.vars.merchantData['merchant_id'],
            type: boxType,
            segment: this.segment
        };
        if(event){
            switch(boxType){
                case 'Trade':
                    this.tradeLoading = true;
                    break;
                case 'Invoice':
                    this.invoiceLoading = true;
                    break;
                case 'Gift':
                    this.giftLoading = true;
                    break;
            }
        }
        await this.http.getData('tradehub', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                switch(this.segment) {
                    case 'inbox':
                        this.inbox = resp.data;
                        break;
                    case 'outbox':
                        this.outbox = resp.data;
                        break;
                    case 'archive':
                        this.archive = resp.data;
                        break;
                }
            } else {
                console.log(resp);
            }
            this.isLoading = false;
            if(event){
                switch(boxType){
                    case 'Trade':
                        this.tradeLoading = false;
                        break;
                    case 'Invoice':
                        this.invoiceLoading = false;
                        break;
                    case 'Gift':
                        this.giftLoading = false;
                        break;
                }
            }
        }, (err: any) => {
            console.log(err);
            this.isLoading = false;
            if(event){
                switch(boxType){
                    case 'Trade':
                        this.tradeLoading = false;
                        break;
                    case 'Invoice':
                        this.invoiceLoading = false;
                        break;
                    case 'Gift':
                        this.giftLoading = false;
                        break;
                }
            }
        });
    }

    switchSegment(event: any) {
        this.segment = event.detail.value;
        this.isLoading = true;
        this.loadSegment();
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
                    this.loadSegment();
                });
            }
        });
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
            console.log(err);
        });
    }

}
