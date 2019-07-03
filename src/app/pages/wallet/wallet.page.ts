import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { VarsService } from 'src/app/services/vars.service';
import { HttpClient } from '@angular/common/http';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { NewTradeComponent } from 'src/app/components/new-trade/new-trade.component';

@Component({
    selector: 'app-wallet',
    templateUrl: './wallet.page.html',
    styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {

    private loading: boolean;
    private locations: any;
    private location: any;
    private locationSearch: string;
    private wallets: any;
    private tradeType: string;
    private searchLocations: any;

    constructor(
        private http: HttpService,
        private vars: VarsService,
        private httpClient: HttpClient,
        private actionSheetCtrl: ActionSheetController,
        private modalCtrl: ModalController,
        private navCtrl: NavController
    ) { }

    ngOnInit() {
        this.loading = true;
        this.httpClient.get("../assets/cities.json").subscribe((resp: any) => {
            this.locations = resp;
            this.locations.filter((loc: any) => {
                const city = this.vars.merchantData['city'];
                const state = this.vars.merchantData['state'];
                if (loc.city === city && loc.state === state) {
                    this.location = loc;
                    this.locationSearch = loc.city + ', ' + loc.abbr;
                    this.loadWallets();
                }
            });
            this.loading = false;
        });
    }

    loadWallets() {
        this.loading = true;
        let body = {
            action: 'getWallets',
            location: this.location,
            merchantId: this.vars.merchantData['merchant_id']
        };
        this.http.getData('wallet', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                this.wallets = resp.data;
            } else {
                console.log(resp);
            }
            this.loading = false;
        }, (err: any) => {
            console.log("There was an error loading wallets");
        });
    }

    filterLocations() {
        const searchString = this.locationSearch;
        if (this.locations && searchString) {
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
            if (searchLocations[0]['city'] + ', ' + searchLocations[0]['abbr'] == searchString || !searchString) { //removes odd bug showing last option after clicking
                searchLocations = [];
            }

            searchLocations = searchLocations.slice(0, 6);
            this.searchLocations = searchLocations;
        }
    }

    checkLocation() {
        let searchString = this.locationSearch;
        this.locations.filter((loc: any) => {
            let combos = [
                loc['city'],
                loc['city'] + "," + loc['abbr'],
                loc['city'] + ", " + loc['abbr']
            ];
            for (let option of combos) {
                if (option.toLowerCase().search(searchString.toLowerCase()) > -1) {
                    this.location = loc;
                }
            }
        });
        this.loadWallets();
    }

    setLocation(loc: any, my?: string) {
        this.locationSearch = loc.city + ', ' + loc.abbr;
        this.location = loc;
        this.searchLocations = [];
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
        })
        await sheet.present();
        await sheet.onDidDismiss().then(async () => {
            if (this.tradeType) {
                const modal = await this.modalCtrl.create({
                    component: NewTradeComponent,
                    componentProps: { tradeType: this.tradeType }
                });
                await modal.present();
            }
        });
    }

}
