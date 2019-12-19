import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { HttpService } from 'src/app/services/http.service';
import { VarsService } from 'src/app/services/vars.service';
import { HttpClient } from '@angular/common/http';
import { SearchableDropdownComponent } from '../../common/searchable-dropdown/searchable-dropdown.component';

@Component({
    selector: 'app-new-trade',
    templateUrl: './new-trade.component.html',
    styleUrls: ['./new-trade.component.scss'],
})
export class NewTradeComponent implements OnInit, AfterViewInit {

    @Input() tradeType: string;
    private urlBody: any = null;
    private merchants: any;
    private title: string;
    private description: string;
    private focus: string;
    private loading = {
        merchants: false,
        wallets: false
    };
    private merchant: any = [];
    private amount: number;
    private merchantSearch: string;
    private searchMerchants: any = [];

    private showLocationSearch = false;
    private locationSearch: string;
    private searchLocations: any = [];
    private location: any;

    private showMyLocationSearch = false;
    private myLocationSearch: string;
    private mySearchLocations: any = [];
    private myLocation: any;

    private wallets: any;
    private wallet: any;

    private myAmount: number;

    constructor(
        private httpClient: HttpClient,
        private http: HttpService,
        private vars: VarsService,
        private modalCtrl: ModalController,
        private toastCtrl: ToastController
    ) {
        this.location = this.vars.defaultLocation;
        this.myLocation = this.vars.defaultLocation;
    }

    ngOnInit() {
        this.loadWallets();
        this.loadMerchants().then((merchants: any) => {
            this.merchants = merchants;
            this.updateMerchants();
        });
    }

    ngAfterViewInit() {
    }

    /**
     * Location Functions
     */

    filterLocations(search: string) {
        const searchLocations = this.vars.locations.filter((loc: any) => {
            const combos = [
                loc.city,
                `${loc.city}, ${loc.abbr}`,
                `${loc.city}, ${loc.abbr}`
            ];
            for (const option of combos) {
                if (option.toLowerCase().search(search.toLowerCase()) > -1) {
                    return loc;
                }
            }
        }).slice(0, 5);

        // removes odd bug showing last option after clicking
        return searchLocations[0].city + ', ' + searchLocations[0].abbr === search || !search ? [] : searchLocations;
    }

    updateSearchLocations(event: any, my?: string) {
        const searchLocations = this.filterLocations(event.detail.value);
        my ? this.mySearchLocations = searchLocations : this.searchLocations = searchLocations;
    }

    setLocation(loc: any, my?: string) {
        my ? this.showMyLocationSearch = false : this.showLocationSearch = false;
        my ? this.myLocationSearch = `${loc.city}, ${loc.abbr}` : this.locationSearch = `${loc.city}, ${loc.abbr}`;
        my ? this.myLocation = loc : this.location = loc;
        my ? this.mySearchLocations = [] : this.searchLocations = [];
        my ? this.wallet = [] : this.merchant = [];
        my ? this.loadWallets()
        : this.loadMerchants().then((merchants: any) => {
            this.merchants = merchants;
            this.updateMerchants();
        });
    }

    /**
     * Merchant Functions
     */

    loadMerchants() {
        this.loading.merchants = true;
        const location = this.location;
        const body = {
            action: 'getMerchants',
            location
        };
        return new Promise(resolve => {
            this.http.getData('merchant', body).subscribe((resp: any) => {
                this.loading.merchants = false;
                if (resp.status === 1) {
                    resolve(resp.data);
                } else {
                    console.log(resp);
                    throw new Error(resp);
                }
            }, (err) => {
                this.loading.merchants = false;
                console.log(err);
                throw new Error(err);
            });
        });
    }

    filterMerchants(search?: string) {
        const merchants = search ? this.merchants.filter((merchant: any) => {
            if (merchant.dba.toLowerCase().search(search.toLowerCase()) > -1) {
                return merchant;
            }
        }).slice(0, 5) : this.merchants;
        // removes odd bug showing last option after clicking
        // if (merchants.length) {
        //     if (search) {
        //         if (merchants[0].dba === search) {
        //             return [];
        //         } else {
        //             return merchants;
        //         }
        //     } else {
        //         return this.merchants;
        //     }
        // }

        return merchants.length ? merchants[0].dba === search ? [] : merchants : [];
    }

    updateMerchants(event?: any) {
        this.searchMerchants = event ? this.filterMerchants(event.detail.value) : this.filterMerchants();
    }

    setMerchant(merchant: any) {
        this.merchantSearch = merchant.dba;
        this.merchant = merchant;
    }

    /**
     * Wallet Functions
     */

    loadWallets() {
        this.loading.wallets = true;
        const body = {
          action: 'getPrivateWallets',
          location: this.myLocation,
          userId: this.vars.userMeta.user_id
        };
        this.http.getData('wallet', body).subscribe((resp: any) => {
            this.loading.wallets = false;
            if (resp.status === 1) {
                this.wallets = resp.data;
            } else {
                console.log(resp);
            }
        }, (err: any) => {
            this.loading.wallets = false;
            console.log(err);
        });
      }

    updateWallet(obj: any) {
        this.wallet = obj.wallet ? obj.wallet : this.wallet;
        this.myAmount = obj.amount ? obj.amount : this.amount;
    }

    updateDescription(obj: any) {
        this.title = obj.title ? obj.title : this.title;
        this.description = obj.description ? obj.description : this.description;
    }

    /**
     * Final Actions
     */

    async sendGift() {
        if (!this.merchant || !this.myAmount) {
            const toast = await this.toastCtrl.create({
                message: 'Please fill out all the required fields',
                duration: 2000,
                color: 'dark'
            });

            return await toast.present();
        }
        this.urlBody = {
            myMerchant: this.vars.userMeta.merchant_id,
            myWallet: this.wallet.wallet_id,
            myAmount: this.myAmount,
            merchant: this.merchant.merchant_id,
            title: this.title,
            description: this.description,
            action: 'sendGift'
        };
        const body = {
            body: JSON.stringify(this.urlBody)
        };
        this.executeType(body);
    }

    async createTrade() {
        if (!this.merchant.merchant_id || !this.myAmount) {
            const toast = await this.toastCtrl.create({
                message: 'Please fill out all required fields',
                duration: 2000,
                color: 'dark'
            });

            return await toast.present();
        } else {
            this.urlBody = {
                merchant: this.merchant.merchant_id,
                myMerchant: this.vars.userMeta.merchant_id,
                myWallet: this.wallet.wallet_id,
                myAmount: this.myAmount,
                title: this.title,
                description: this.description,
                action: 'createTrade'
            };
            const body = {
                body: JSON.stringify(this.urlBody)
            };
            this.executeType(body);
        }
    }

    async sendInvoice() {
        if (!this.merchant.merchant_id || !this.amount) {
            const toast = await this.toastCtrl.create({
                message: 'Please fill out all required fields',
                duration: 2000,
                color: 'dark'
            });

            return await toast.present();
        } else {
            this.urlBody = {
                merchant: this.merchant.merchant_id,
                myMerchant: this.vars.userMeta.merchant_id,
                amount: this.amount,
                title: this.title,
                description: this.description,
                action: 'createInvoice'
            };

            const body = {
                body: JSON.stringify(this.urlBody)
            };
            this.executeType(body);
        }
    }

    executeType(body: any) {
        this.http.postData('tradehub', body).subscribe(async (resp: any) => {
            if (resp.status === 1) {
                const message =
                    (this.tradeType === 'Gift') ? 'Gift Sent' :
                        (this.urlBody.action === 'createTrade' || this.urlBody.action === 'createInvoice') ?
                            `${this.tradeType} Created` : `${this.tradeType} Updated`;
                const toast = await this.toastCtrl.create({
                    message,
                    duration: 2000,
                    color: 'dark'
                });
                await toast.present();
                this.modalCtrl.dismiss();
            } else {
                const message = (this.urlBody.action === 'createTrade') ? `create` : `update`;
                const toast = await this.toastCtrl.create({
                    message: `Unable to ${message} ${this.tradeType}`,
                    duration: 2000,
                    color: 'dark'
                });
                await toast.present();
                console.log(resp);
            }
        }, (err) => {
            console.log(err);
        });
    }

    setFocus(focus?: string, event?: Event) {
        if (event) {
            event.stopPropagation();
        }
        this.focus = focus;
    }

    get currentFocus() {
        return this.focus;
    }
}
