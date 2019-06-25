import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';
import { VarsService } from 'src/app/services/vars.service';
import { ToastController, AlertController, ModalController } from '@ionic/angular';
import { NewTradeComponent } from 'src/app/components/new-trade/new-trade.component';

@Component({
    selector: 'app-details',
    templateUrl: './details.page.html',
    styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

    private tradeId: number;
    private trade: any;
    private tradeType: string;
    private tradeIsLoading: boolean = true;
    private executing: boolean = false;
    private details: any;
    private myDetails: any;
    private referrer: string;

    constructor(
        private route: ActivatedRoute,
        private http: HttpService,
        private vars: VarsService,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private modalCtrl: ModalController
    ) { }

    ngOnInit() {
        this.route.params.subscribe((params: any) => {
            this.tradeId = params.id;
        });
        this.getTrade().then(()=>{
            this.tradeIsLoading = false;
        });
    }

    async getTrade(){
        const body = {
            action: 'getTrade',
            tradeId: this.tradeId
        };
        return new Promise((resolve, reject) => {
            this.http.getData('details', body).subscribe((resp: any) => {
                if (resp.status === 1) {
                    this.trade = resp.data;
                    this.tradeType = this.trade.tradeData.type;
                    if(this.trade.initData.dba === this.vars.merchantData['dba']){ //this merchant started trade
                        this.referrer = this.trade.tradeData.trade_completed ? "archive" : "outbox";
                        this.details = this.trade.recData;
                        this.myDetails = this.trade.initData;
                    } else {
                        this.referrer = "inbox";
                        this.details = this.trade.initData;
                        this.myDetails = this.trade.recData;
                    }
                } else {
                    console.log(resp);
                    reject();
                }
            }, (err: any) => {
                console.log("There was an error getting trade details");
                reject();
            }, () => {
                resolve();
            });
        });
    }
    
    async doAction(type: string){

        const runChecksAndExecute = async () => {
            //Error handling: These should be very rare. Might occur when something has drained their wallet from the initial setup.)
            this.getTrade().then(async ()=>{
                if(type === 'accept'){
                    if(+this.myDetails.valu > +this.myDetails.wallet_cap && (this.tradeType === 'Invoice' || this.tradeType === 'Trade')){
                        const header = (this.tradeType === 'Trade') ? "Cannot Accept Trade" : "Cannot Pay Invoice";
                        const alert = await this.alertCtrl.create({
                            header: header,
                            subHeader: `Exceeds Your Wallet`,
                            message: `Your wallet has only ${this.myDetails.wallet_cap} (vs ${this.myDetails.valu}) in ${this.myDetails.wallet_dba} Valu.`,
                            buttons: [{
                                text: 'OK',
                                role: 'cancel',
                                handler: () => {
                                    this.executing = false;
                                    return false;
                                }
                            }]
                        });
                        return await alert.present();
                    }
    
                    if(+this.details.valu > +this.details.wallet_cap && (this.tradeType === 'Trade' || this.tradeType === 'Gift')){
                        const alert = await this.alertCtrl.create({
                            header: `Cannot Accept ${this.tradeType}`,
                            subHeader: `Exceeds Their Wallet`,
                            message: `Your partner has only ${this.details.wallet_cap} (vs. ${this.details.valu}) in ${this.details.wallet_dba} Valu.<br/><br/>Please contact your parter to resolve the issue.`,
                            buttons: [{
                                text: 'OK',
                                role: 'cancel',
                                handler: () => {
                                    this.executing = false;
                                    return false;
                                }
                            }]
                        });
                       return await alert.present();
                    }
                    
                    if(this.tradeType === "Trade"){
                        const alert = await this.alertCtrl.create({
                            header: 'Confirm Trade',
                            message: `Do you want to trade ${this.myDetails.valu} ${this.myDetails.wallet_dba} Valu for ${this.details.valu} ${this.details.wallet_dba} Valu?`,
                            buttons: [{
                                text: 'Cancel',
                                role: 'cancel',
                                handler: () => {
                                    this.executing = false;
                                    return false;
                                }
                            },{
                                text: 'Trade',
                                handler: () => {
                                    execute();
                                    return true;
                                }
                            }]
                        });
                        return await alert.present();
                    };
                    if(this.tradeType === "Gift"){
                        const alert = await this.alertCtrl.create({
                            header: 'Accept Gift',
                            message: `Do you want to accept ${this.details.valu} in ${this.details.wallet_dba} Valu?`,
                            buttons: [{
                                text: 'No',
                                role: 'cancel',
                                handler: () => {
                                    this.executing = false;
                                    return false;
                                }
                            },{
                                text: 'Yes',
                                handler: () => {
                                    execute();
                                    return true;
                                }
                            }]
                        });
                        return await alert.present();
                    };

                    if(this.tradeType === "Invoice"){
                        const alert = await this.alertCtrl.create({
                            header: 'Confirm Payment',
                            message: `Do you want to pay ${this.myDetails.valu} in ${this.myDetails.wallet_dba} Valu to ${this.details.dba}?`,
                            buttons: [{
                                text: 'Cancel',
                                role: 'cancel',
                                handler: () => {
                                    this.executing = false;
                                    return false;
                                }
                            },{
                                text: 'Yes',
                                handler: () => {
                                    execute();
                                    return true;
                                }
                            }]
                        });
                        return await alert.present();
                    }
                }
            })
        }

        const execute = () => {
            this.executing = true;
            const status = () => {
                switch(type){
                    case 'accept':
                        return 'Completed';
                    case 'cancel':
                        return 'Canceled';
                    case 'decline':
                        return 'Declined';
                    default:
                        return 'Proposed';
                }
            };
            const body = {
                body: JSON.stringify({'action': type, 'tradeId': this.tradeId, 'status': status()})
            };
            this.http.postData('details', body).subscribe((resp:any) => {
                if(resp.status === 1){
                    this.getTrade().then(()=>{
                        const pastType = (type == 'decline') ? 'declined' : type+'ed';
                        this.presentToast(`Trade ${pastType}`, 4000, 'dark', type);
                        this.executing = false;
                    });
                } else {
                    this.presentToast(`Unable to ${type} trade`, 3000, 'dark');
                    this.executing = false;
                }
            }, (err) => {
                console.log("There was a fatal error while manipulating the trade");
                this.executing = false;
            });
        };

        if(type === 'accept'){ //from inbox
            this.executing = true;
            runChecksAndExecute();
        } else {
            this.executing = true;
            const alert = await this.alertCtrl.create({
                header: `Confirm ${type.slice(0,1).toUpperCase()+type.slice(1)}`,
                message: `Are you sure you want to ${type} this trade?`,
                buttons: [{
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        this.executing = false;
                        return;
                    }
                },{
                    text: 'Yes',
                    handler: () => {
                        execute();
                    }
                }]
            });
            return await alert.present();
        }
    }

    undoAction(prevAction: string){
        const body = {
            body: JSON.stringify({action: 'undo', prevAction: prevAction, tradeId: this.tradeId})
        }
        this.http.postData('details', body).subscribe((resp:any) =>{
            if(resp.status === 1){
                this.getTrade().then(()=>{
                    this.presentToast('Trade Reversed', 3000, 'dark');
                });
            } else {
                this.presentToast('Unable to reverse trade', 3000, 'dark');
            }
        }, (err) =>{
            console.log("There was a fatal error while undoing the action");
        })
    }

    async selectValu(){
        const modal = await this.modalCtrl.create({
            component: NewTradeComponent,
            componentProps: {tradeId: this.tradeId}
        });
        await modal.present();
        await modal.onDidDismiss().then(()=>{
            this.tradeIsLoading = true;
            this.getTrade().then(()=>{
                this.tradeIsLoading = false;
            });
        });
    }

    async presentToast(message: string, duration: number, color: string, prevAction?: string){
        const toast = await this.toastCtrl.create({
            message: message,
            duration: duration,
            color: color
        });
        if(prevAction){
            toast.buttons = [{
                side: 'end',
                text: 'Undo',
                handler: () => {
                    return this.undoAction(prevAction);
                }
            }]
        }
       return await toast.present();
    }

}
