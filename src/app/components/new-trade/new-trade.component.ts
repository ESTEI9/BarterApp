import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ModalController, IonSlides, ToastController } from '@ionic/angular';
import { HttpService } from 'src/app/services/http.service';
import { VarsService } from 'src/app/services/vars.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-new-trade',
    templateUrl: './new-trade.component.html',
    styleUrls: ['./new-trade.component.scss'],
})
export class NewTradeComponent implements OnInit {

    @Input() tradeId: number;
    @Input() tradeType: string;
    private tradeDetails: any;
    private locations: any = '';
    private urlBody: any = null;
    private merchants: any;
    private enableCreateTrade: boolean = false;
    private notes: string;
    private loadingWallet: boolean = false;
    private loadingMyWallet: boolean = false;
    private loadingTrade: boolean = false;
    private notesLeft: number = 500;

    private locationSearch: string;
    private searchLocations: any = [];
    private location: any;
    private merchant: any = [];
    private wallets: any = [];
    private wallet: any;
    private amount: number;

    private myLocationSearch: string;
    private mySearchLocations: any = [];
    private myLocation: any = [];
    private myWallets: any;
    private myWallet: any;
    private myAmount: number;

    constructor(
        private httpClient: HttpClient,
        private http: HttpService,
        private vars: VarsService,
        private modalCtrl: ModalController,
        private toastCtrl: ToastController
    ) {}

    ngOnInit() {
        if(!this.locations){
            this.httpClient.get("../assets/cities.json").subscribe((resp: any) => {
                this.locations = resp;
                // this.locations.filter((loc:any) => {
                //     const city = this.vars.merchantData['city'];
                //     const state = this.vars.merchantData['state'];
                //     if(loc.city === city && loc.state === state){
                //         this.location = loc;
                //         this.locationSearch = loc.city+', '+loc.abbr;
                //         this.myLocation = loc;
                //         this.myLocationSearch = loc.city+', '+loc.abbr;
                //         this.loadMerchants();
                //         this.loadMerchants('my');
                //         this.loadWallets();
                //     }
                // });
            });

            if(this.tradeId){
                this.loadingTrade = true;
                const body = {
                    action: 'getTrade',
                    tradeId: this.tradeId
                };
                this.http.getData('details', body).subscribe(async (resp:any) => {
                    if(resp.status === 1){
                        this.tradeDetails = resp.data;
                        this.tradeType = this.tradeDetails.tradeData.type;
                    } else {
                        const toast = await this.toastCtrl.create({
                            message: 'Fatal Error: Unable to load trade details',
                            duration: 3000,
                            color: 'dark'
                        });
                        await toast.present();
                        this.modalCtrl.dismiss();
                    }
                    this.loadingTrade = false;
                });
            }
        }
    }

    filterLocations(my?: any) {
        const searchString = (my) ? this.myLocationSearch : this.locationSearch;
        if(this.locations && searchString){
            let searchLocations = [];
            searchLocations = this.locations.filter((loc: any) => {
                if (searchLocations.length < 6) {
                    let combos = [
                        loc['city'],
                        loc['city'] + "," + loc['abbr'],
                        loc['city'] + ", " + loc['abbr']
                    ];
                    for (let option of combos) {
                        if (option.toLowerCase().search(searchString.toLowerCase()) > -1) {
                            return loc;
                        }
                    }
                };
            });
            if(searchLocations[0]['city']+', '+searchLocations[0]['abbr'] == searchString || !searchString){ //removes odd bug showing last option after clicking
                searchLocations = [];
            }

            searchLocations = searchLocations.slice(0, 6);
            if (my) {
                this.mySearchLocations = searchLocations;
            } else {
                this.searchLocations = searchLocations;
            }
        }
    }

    checkLocation(my?:string){
        let searchString = my ? this.myLocationSearch : this.locationSearch;
        this.locations.filter((loc:any) => {
            let combos = [
                loc['city'],
                loc['city'] + "," + loc['abbr'],
                loc['city'] + ", " + loc['abbr']
            ];
            for (let option of combos) {
                if (option.toLowerCase().search(searchString.toLowerCase()) > -1) {
                    if(my) {
                        this.myLocation = loc;
                    } else {
                        this.location = loc;
                    }
                }
            }
        });
        if(my && this.myLocation){
            this.loadWallets('my');
        }
        if(this.location){
            this.loadWallets();
        }
    }

    setLocation(loc: any, my?: string) {
        if (my) {
            this.myLocationSearch = loc.city + ', ' + loc.abbr;
            this.myLocation = loc;
            this.mySearchLocations = [];
        } else {
            this.locationSearch = loc.city + ', ' + loc.abbr;
            this.location = loc;
            this.searchLocations = [];
            this.loadMerchants();
        }
    }

    loadMerchants(my?:string) {
        let location = my ? this.myLocation : this.location;
        let body = {
            action: 'getMerchants',
            location: location
        };
        this.http.getData('merchant', body).subscribe((resp:any)=> {
            if(resp.status === 1){
                this.merchants = resp.data;
            } else {
                console.log(resp);
            }
        }, (err) => {
            console.log("There was an error loading merchants");
        });
    }

    loadWallets(my?:any) {
        my ? this.loadingMyWallet = true : this.loadingWallet = true;
        let merchantId = this.vars.merchantData['merchant_id'];
        const location = (my) ? this.myLocation : this.location;
        let body = {
            action: 'getWallets',
            location: location,
            merchantId: merchantId
        };
        this.http.getData('wallet', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                if(my) { this.myWallets = resp.data } else { this.wallets = resp.data;};
            } else {
                console.log(resp);
            }
            my ? this.loadingMyWallet = false : this.loadingWallet = false;
        }, (err: any) => {
            console.log("There was an error loading wallets");
        });
    }

    async sendGift() {
        if(!this.merchant || !this.myAmount){
            const toast = await this.toastCtrl.create({
                message: 'Please fill out all the required fields',
                duration: 2000,
                color: 'dark'
            });

            return await toast.present();
        }
        this.urlBody = {
            'myMerchant': this.vars.merchantData['merchant_id'],
            'myWallet': this.myWallet.wallet_id,
            'myAmount': this.myAmount,
            'merchant': this.merchant.merchant_id,
            'notes':    this.notes,
            'action': 'sendGift'
        };
        const body = {
            body: JSON.stringify(this.urlBody)
        };
        this.executeType(body);
    }

    async createTrade() {
        if(!this.merchant.merchant_id || !this.myAmount){
            const toast = await this.toastCtrl.create({
                message: 'Please fill out all required fields',
                duration: 2000,
                color: 'dark'
            });

            return await toast.present();
        } else {
            this.urlBody = {
                merchant: this.merchant.merchant_id,
                myMerchant: this.vars.merchantData['merchant_id'],
                myWallet: this.myWallet.wallet_id,
                myAmount: this.myAmount,
                notes : this.notes,
                action: 'createTrade'
            };
            const body = {
                body: JSON.stringify(this.urlBody)
            }
            this.executeType(body);
        }
    }

    async sendInvoice(){
        if(!this.merchant.merchant_id || !this.amount){
            const toast = await this.toastCtrl.create({
                message: 'Please fill out all required fields',
                duration: 2000,
                color: 'dark'
            });

            return await toast.present();
        } else {
            this.urlBody = {
                merchant: this.merchant.merchant_id,
                myMerchant: this.vars.merchantData['merchant_id'],
                amount: this.amount,
                notes : this.notes,
                action: 'createInvoice'
            };

            const body = {
                body: JSON.stringify(this.urlBody)
            }
            this.executeType(body);
        }
    }

    async updateTrade() {
        if(!this.myWallet || !this.myAmount){
            const toast = await this.toastCtrl.create({
                message: 'Please fill out all the required fields',
                duration: 2000,
                color: 'dark'
            });
            return await toast.present();
        } else {
            this.urlBody = {
                tradeId: this.tradeId,
                myWallet: this.myWallet.wallet_id,
                myAmount: this.myAmount,
                action: 'updateTrade'
            };
            const body = {
                body: JSON.stringify(this.urlBody)
            };
            this.executeType(body);
        }
    }

    executeType(body:any){
        this.http.postData('tradehub', body).subscribe(async (resp:any) => {
            if(resp.status === 1){
                const message = (this.tradeType === 'Gift') ? 'Gift Sent' : (this.urlBody['action'] === 'createTrade' || this.urlBody['action'] === 'createInvoice') ? `${this.tradeType} Created` : `${this.tradeType} Updated`;
                const toast = await this.toastCtrl.create({
                    message: message,
                    duration: 2000,
                    color: 'dark'
                });
                await toast.present();
                this.modalCtrl.dismiss();
            } else {
                const message = (this.urlBody['action'] === 'createTrade') ? `create` : `update`;
                const toast = await this.toastCtrl.create({
                    message: `Unable to ${message} ${this.tradeType}`,
                    duration: 2000,
                    color: 'dark'
                });
                await toast.present();
                console.log(resp);
            }
        }, (err) => {
            console.log("There was an error creating/updating a trade.");
        });
    }

    checkNotesLength(length: any){
        let notes = this.notes;
        this.notesLeft = 500 - length;
        if(this.notesLeft <= 0){
            this.notes = notes;
        }
    }

}
