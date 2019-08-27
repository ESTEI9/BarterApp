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
    private locPlaceholder = 'Change Location';

    constructor(
        private http: HttpService,
        private vars: VarsService,
        private httpClient: HttpClient,
        private actionSheetCtrl: ActionSheetController,
        private modalCtrl: ModalController,
        private navCtrl: NavController
    ) { }

    ngOnInit() {
        this.vars.locations.filter((loc: any) => {
            if (loc.city === this.vars.merchantData.city && loc.state === this.vars.merchantData.state) {
                this.location = loc;
                this.loadWallets();
            }
        });
    }

    loadWallets() {
        this.loading = true;
        const body = {
            action: 'getPrivateWallets',
            location: this.location,
            merchantId: this.vars.merchantData.merchant_id
        };
        this.http.getData('wallet', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                this.wallets = resp.data;
            } else {
                console.log(resp);
            }
            this.loading = false;
        }, (err: any) => {
            console.log(err);
        });
    }

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

      updateSearchLocations(event: any) {
        const searchLocations = this.filterLocations(event.detail.value);
        this.searchLocations = searchLocations;
      }

    setLocation(loc: any) {
        this.locationSearch = `${loc.city}, ${loc.abbr}`;
        this.location = loc;
        this.searchLocations = [];
        this.loadWallets();
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
        });
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
