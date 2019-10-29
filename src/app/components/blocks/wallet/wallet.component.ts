import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { ModalController, ToastController } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit, OnChanges {
  private options: any;
  private wallet: any;
  private amount: number;

  private loading = false;
  private locationSearch: string;
  private location: object;
  private searchLocations: Array<object>;
  private locPlaceholder = 'Search Locations';
  private updateLocation = false;

  @Input() modal = false;
  @Input() wallets?: any;
  @Input() value: string;
  @Input() toggle?: string | boolean;
  @Output() update = new EventEmitter();

  constructor(
    private http: HttpService,
    private modalCtrl: ModalController,
    private vars: VarsService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    if (!this.wallets) {
      this.location = this.vars.defaultLocation;
      this.locationSearch = `${this.vars.defaultLocation.city}, ${this.vars.defaultLocation.abbr}`;
      this.loadWallets().then((wallets: Array<object>) => {
        this.wallets = wallets;
        this.setOptions();
      });
    } else {
      this.setOptions();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.wallet && changes.wallet.currentValue) {
      const wallets: SimpleChange = changes.wallets.currentValue;
      this.wallets = wallets;
      this.loading = false;
    }
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
    this.locPlaceholder = this.locationSearch;
    this.location = loc;
    this.searchLocations = [];
    this.loading = true;
    this.updateLocation = false;
    this.loadWallets().then((wallets: Array<object>) => {
      this.wallets = wallets;
      this.options = wallets;
    });
}

  loadWallets() {
    const body = {
        action: this.vars.userMeta.is_merchant ? 'getWalletCounts' : 'getPrivateWallets',
        location: this.location,
        userId: this.vars.userMeta.user_id
    };
    return new Promise(resolve =>
        this.http.getData('wallet', body).subscribe((resp: any) => {
        if (resp.status === 1) {
            resolve(resp.data);
        } else {
            console.log(resp);
            this.errorToast();
        }
        this.loading = false;
    }, (err: any) => {
        console.log(err);
        this.errorToast();
        this.loading = false;
        resolve(false);
    }));
}

  setOptions(search?: any) {
    this.options = this.wallets.filter((wallet: any) => {
      if (search && wallet.dba.toLowerCase().search(search.toLowerCase()) > -1) {
        return wallet;
      }
    }).slice(0, 5);

    if (this.options.length === 1 && this.wallet && this.wallet.dba.toLowerCase() === search.toLowerCase()) {
      this.options = [];
    }

    if (!search) {
      this.options = this.wallets;
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

  setFocus(focus?: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.toggle = focus;
  }

  get currentFocus() {
    return this.toggle;
  }

  async errorToast() {
    const toast = await this.toastCtrl.create({
        message: 'There was an error',
        duration: 2000,
        color: 'dark',
        position: 'top'
    });
    await toast.present();
  }

}
