import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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

    private locations: any = '';
    private urlBody: any = null;
    private merchants: any;
    private enableCreateTrade: boolean = false;

    private initialSlide: boolean = true;
    private lastSlide: boolean = false;

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
    private myWallets: any = [];
    private myWallet: any;
    private myAmount: number;
    
    private sliderOptions: any = {}

    @ViewChild('slider') slider: IonSlides;
    @ViewChild('createTradeButton', {read: ElementRef}) createTradeButton: ElementRef;

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
                this.locations.filter((loc:any) => {
                    const city = this.vars.merchantData['city'];
                    const state = this.vars.merchantData['state'];
                    if(loc.city === city && loc.state === state){
                        this.location = loc;
                        this.locationSearch = loc.city+', '+loc.abbr;
                        this.myLocation = loc;
                        this.myLocationSearch = loc.city+', '+loc.abbr;
                        this.loadMerchants();
                        this.loadMerchants('my');
                        this.loadWallets();
                    }
                });
            });
        }
    }

    filterLocations(my?: any) {
        if(this.locations){
            const searchString = (my) ? this.myLocationSearch : this.locationSearch;
            let searchLocations = [];
            searchLocations = this.locations.filter((loc: any) => {
                if (searchLocations.length < 10) {
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
            if (my) {
                this.mySearchLocations = searchLocations.slice(0, 10);
            } else {
                this.searchLocations = searchLocations.slice(0, 10);
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
        })
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

    loadWallets(event?: any) {
        if(event) {this.merchant = event.detail.value;}
        let merchantId = (event) ? this.merchant['merchant_id'] : this.vars.merchantData['merchant_id'];
        let location = (event) ? this.location : this.myLocation;
        let body = {
            action: 'getWallets',
            location: location,
            merchantId: merchantId
        };
        this.http.getData('wallet', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                if(event){this.wallets = resp.data;} else {this.myWallets = resp.data;}
            } else {
                console.log(resp);
            }
        }, (err: any) => {
            console.log("There was an error loading wallets");
        });
    }

    slidePrev(){
        this.slider.slidePrev();
        this.lastSlide = false;
        this.slider.getActiveIndex().then((i:number) => {
            this.initialSlide = (i == 0);
        });
    }

    async slideNext() {
        this.slider.slideNext();
        this.slider.getActiveIndex().then((i:number) => {
            this.lastSlide = (i === 2);
            if(i === 2){
                this.urlBody = {
                    'merchant': this.merchant.merchant_id,
                    'wallet': this.wallet.wallet_id,
                    'amount': this.amount,
                    'myMerchant': this.vars.merchantData['merchant_id'],
                    'myWallet': this.myWallet.wallet_id,
                    'myAmount': this.myAmount
                };
                console.log(this.urlBody);
                this.enableCreateTrade = (this.merchant && this.wallet && this.amount && this.myWallet && this.myAmount) ? true : false;
            }
            if(i > 0){
                this.initialSlide = false;
            }
        });
    }

    createTrade() {
        const body = {
            body: JSON.stringify({action: 'createTrade', ...this.urlBody})
        }
        this.http.postData('tradehub', body).subscribe(async (resp:any) => {
            if(resp.status === 1){
                const toast = await this.toastCtrl.create({
                    message: 'Trade Created',
                    duration: 2000,
                    color: 'dark'
                });
                await toast.present();
                this.modalCtrl.dismiss();
            } else {
                const toast = await this.toastCtrl.create({
                    message: 'Unable to created trade',
                    duration: 2000,
                    color: 'dark'
                });
                await toast.present();
                console.log(resp);
            }
        }, (err) => {
            console.log("There was an error creating a trade.");
        });
    }

}
