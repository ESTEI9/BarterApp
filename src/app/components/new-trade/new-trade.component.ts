import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpService } from 'src/app/services/http.service';
import { VarsService } from 'src/app/services/vars.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-new-trade',
    templateUrl: './new-trade.component.html',
    styleUrls: ['./new-trade.component.scss'],
})
export class NewTradeComponent implements OnInit {

    private locations: any = '';
    private details: any = null;
    private isDisabled: boolean = true;
    private merchants: any;
    private tempLoc: any;
    private searchLocations: any = [];

    private locationSearch: string;
    private location: any;
    private merchant: any;
    private wallets: any;
    private wallet: any;
    private amount: number;

    private myLocationSearch: string;
    private mySearchLocations: any = [];
    private myLocation: any = '';
    private myWallets: any;
    private myWallet: any;
    private myAmount: number;

    constructor(
        private httpClient: HttpClient,
        private http: HttpService,
        private vars: VarsService,
        private modalCtrl: ModalController
    ) {}

    ngOnInit() {
        this.httpClient.get("../assets/cities.json").subscribe(async (resp: any) => {
            this.locations = resp;
            await this.locations.filter((loc:any) => {
                const city = this.vars.merchantData['city'];
                const state = this.vars.merchantData['state'];
                if(loc.city === city && loc.state === state){
                    this.myLocation = loc;
                }
            });
            this.loadWallets();
        });
    }

    filterLocations(my?: any) {
        const searchString = (my) ? this.myLocationSearch : this.locationSearch;
        if(my){
            this.myLocation = null;
        } else {
            this.location = null;
        }
        let searchLocations = [];
        searchLocations = this.locations.filter((loc: any) => {
            if (searchLocations.length < 10) {
                let combos = [
                    loc['city'],
                    loc['state'],
                    loc['abbr'],
                    loc['city'] + "," + loc['state'],
                    loc['city'] + ", " + loc['state'],
                    loc['city'] + "," + loc['abbr'],
                    loc['city'] + ", " + loc['abbr']
                ];
                for (let option of combos) {
                    if (option.search(searchString) > -1) {
                        return loc;
                    }
                }
            };
        });
        if (my) {
            this.mySearchLocations = searchLocations.slice(0, 10);
        } else {
            this.searchLocations = searchLocations.slice(0, 10);
        }
    }

    setLocation(loc: any, my?: string) {
        if (my) {
            this.myLocationSearch = loc.city + ', ' + loc.abbr;
            this.myLocation = loc;
            this.searchLocations = [];
        } else {
            this.locationSearch = loc.city + ', ' + loc.abbr;
            this.location = loc;
            this.mySearchLocations = [];
            this.loadMerchants();
        }
    }

    loadMerchants() {
        const body = {
            action: 'getMerchants',
            location: this.location
        }
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

    loadWallets(event?: any) {
        const merchantId = (event) ? event.detail.value['merchant_id'] : this.vars.merchantData['merchant_id'];
        const location = (event) ? this.location : this.myLocation;
        const body = {
            action: 'getWallets',
            location: location,
            merchantId: merchantId
        };
        this.http.getData('wallet', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                this.wallets = resp.data;
            } else {
                console.log(resp);
            }
        }, (err: any) => {
            console.log("There was an error loading wallets");
        });
    }

    checkTrade() {
        if (!this.isDisabled || !this.merchant || !this.wallet || !this.amount || !this.myWallet || !this.myAmount) {
            return true;
        } else {
            return false;
        }
    }

    createTrade() {
        this.details = {
            'merchant': this.merchant,
            'wallet': this.wallet,
            'amount': this.amount,
            'myWallet': this.myWallet,
            'myAmount': this.myAmount
        }
        console.log(this.details);
        // this.modalCtrl.dismiss({
        //     'tradeData': this.details
        // })
    }

}
