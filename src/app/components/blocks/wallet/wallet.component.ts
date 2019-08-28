import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { ModalController } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit, AfterViewInit {
  private options: any;
  private wallet: any;
  private amount: number;

  private locationSearch: string;
  private searchLocations: any = [];
  private location: any;

  private wallets: any;
  private loading = false;

  @Input() modal = false;
  @Output() update = new EventEmitter();

  constructor(
    private http: HttpService,
    private modalCtrl: ModalController,
    private vars: VarsService
  ) { }

  ngOnInit() { }

  ngAfterViewInit() { }

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

  loadWallets() {
    this.loading = true;
    const body = {
      action: 'getPrivateWallets',
      location: this.location,
      merchantId: this.vars.merchantData.merchant_id
    };
    this.http.getData('wallet', body).subscribe((resp: any) => {
      this.loading = false;
      if (resp.status === 1) {
        this.wallets = this.transformWallets(resp.data);
      } else {
        console.log(resp);
      }
    }, (err: any) => {
      console.log(err);
    });
  }

  transformWallets(wallets: any) {
    return wallets.map((wallet: any) => {
      if (wallet.dba === this.vars.merchantData.dba) {
        wallet.feathers = null;
      }
      return wallet;
    });
  }

  setOptions(search?: any) {
    this.options = this.wallets.filter((wallet: any) => {
      if (search && wallet.dba.toLowerCase().search(search.toLowerCase()) > -1) {
        return wallet;
      }
    }).slice(0, 5);

    if (this.options[0] && this.options[0].dba === search || !search) {
      this.options = [];
    }

  }

  setWallet(wallet: any) {
    this.wallet = wallet;
    this.setOptions();
  }

  updateWallet() {
    if (this.modal) {
      this.modalCtrl.dismiss({
        wallet: this.wallet,
        amount: this.amount
      });
    } else {
      this.update.emit({ wallet: this.wallet, amount: this.amount });
    }
  }

}
