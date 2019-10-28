import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { VarsService } from 'src/app/services/vars.service';
import { ToastController, AlertController, ModalController, NavParams } from '@ionic/angular';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit, AfterViewInit {

    private tradeId: number;
    private trade: any;
    private tradeType: string;
    private loading = true;
    private executing = false;
    private details: any;
    private myDetails: any;
    private referrer: string;

    constructor(
        private http: HttpService,
        private vars: VarsService,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private modalCtrl: ModalController,
        private navParams: NavParams
    ) {
        this.tradeId = this.navParams.get('id');
    }

    ngOnInit() { }

    ngAfterViewInit() {
        this.getTrade().then(() => {
            this.loading = false;
        });
    }

    async getTrade() {
        const body = {
            action: 'getTrade',
            tradeId: this.tradeId
        };
        await this.http.getData('details', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                this.trade = resp.data;
                this.tradeType = this.trade.tradeData.type;
                console.log(this.trade.initData, this.vars.userMeta);
                if (+this.trade.initData.merchant_id === +this.vars.userMeta.user_id) { // this merchant started trade
                    this.referrer = this.trade.tradeData.trade_completed ? 'archive' : 'outbox';
                    console.log(this.referrer);
                    this.details = this.trade.recData;
                    this.myDetails = this.trade.initData;
                } else {
                    this.referrer = 'inbox';
                    this.details = this.trade.initData;
                    this.myDetails = this.trade.recData;
                }
            } else {
                console.log(resp);
            }
        }, (err: any) => {
            console.log(err);
        });
    }

    async doTrade(type: string) {
        this.getTrade().then(() => {
            this.runChecks().then((checksPass: boolean) => {
                if (checksPass) {
                    this.runPrompts(type).then((action) => {
                        if (action.role === 'execute') {
                            this.completeTrade(type);
                        } else {
                            this.executing = false;
                        }
                    });
                }
            });
        });
    }

    async runChecks() {
        if (+this.myDetails.valu > +this.myDetails.wallet_cap
            && this.myDetails.user_id !== this.myDetails.vendor_id
            && this.tradeType === 'Trade'
        ) {
            const alert = await this.alertCtrl.create({
                header: 'Cannot Accept Trade',
                subHeader: `Exceeds Your Wallet`,
                message: `Your wallet has only ${this.myDetails.wallet_cap}
                 (vs ${this.myDetails.valu}) ${this.myDetails.wallet_dba} tokens.`,
                buttons: [{
                    text: 'OK',
                    role: 'cancel',
                    handler: () => {
                        this.executing = false;
                    }
                }]
            });
            await alert.present();
            return false;
        }
        if (+this.details.valu > +this.details.wallet_cap
            && this.details.user_id !== this.details.vendor_id
            && this.tradeType === 'Trade'
        ) {
            const alert = await this.alertCtrl.create({
                header: `Cannot Accept ${this.tradeType}`,
                subHeader: `Exceeds Their Wallet`,
                message: `Your partner doesn't have enough ${this.details.wallet_dba}.
                <br/><br/>Please contact your parter to resolve the issue.`,
                buttons: [{
                    text: 'OK',
                    role: 'cancel',
                    handler: () => {
                        this.executing = false;
                    }
                }]
            });
            await alert.present();
            return false;
        }
        return true;
    }

    async runPrompts(type: string) {
        const buttons = [
            { text: 'No', role: 'cancel' },
            { text: 'Yes', role: 'execute' }
        ];
        let title: string;
        let prompt: string;
        const makePrompt = async (header: string, message: string) => {
            const alert = await this.alertCtrl.create({
                header,
                message,
                buttons
            });
            await alert.present();
            return await alert.onDidDismiss().then((resp) => {
                return resp;
            });
        };

        if (type === 'accept') {
            switch (this.tradeType) {
                case 'Trade':
                    title = 'Confirm Trade';
                    prompt = `Do you want to trade ${this.myDetails.valu} ${this.myDetails.wallet_dba} for
                        ${this.details.valu} ${this.details.wallet_dba}?`;
                    break;
                case 'Gift':
                    title = 'Accept Gift';
                    prompt = `Do you want to accept ${this.details.valu} ${this.details.wallet_dba} unibytes?`;
                    break;
                case 'Invoice':
                    title = 'Confirm Payment';
                    prompt = `Do you want to pay ${this.myDetails.valu} unibytes to ${this.details.dba}?`;
                    break;
            }
        } else {
            title = `Confirm ${type.slice(0, 1).toUpperCase() + type.slice(1)}`;
            prompt = `Are you sure you want to ${type} this trade?`;
        }
        return makePrompt(title, prompt);
    }

    completeTrade(type: string) {
        let status: string;
        switch (type) {
            case 'accept':
                status = 'Completed';
                break;
            case 'cancel':
                status = 'Canceled';
                break;
            case 'decline':
                status = 'Declined';
                break;
            default:
                status = 'Proposed';
        }
        const body = {
            body: JSON.stringify({ action: type, tradeId: this.tradeId, status })
        };
        this.http.postData('details', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                this.presentToast(`Trade ${status.toLowerCase()}`, 4000, 'dark', type);
            } else {
                this.presentToast(`Unable to ${type} trade`, 3000, 'dark');
            }
            this.executing = false;
        }, (err) => {
            console.log(err);
            this.executing = false;
        });
    }

    undoTrade(prevAction: string) {
        const body = {
            body: JSON.stringify({ action: 'undo', prevAction, tradeId: this.tradeId })
        };
        this.http.postData('details', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                this.getTrade().then(() => {
                    this.presentToast('Trade Reversed', 3000, 'dark');
                });
            } else {
                this.presentToast('Unable to reverse trade', 3000, 'dark');
            }
        }, (err) => {
            console.log(err);
        });
    }

    async presentToast(message: string, duration: number, color: string, prevAction?: string) {
        const toast = await this.toastCtrl.create({
            message,
            duration,
            color,
            position: 'top'
        });
        if (prevAction) {
            toast.buttons = [{
                side: 'end',
                text: 'Undo',
                handler: () => {
                    return this.undoTrade(prevAction);
                }
            }];
        }
        return await toast.present();
    }

}
