import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';
import { ToastController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.page.html',
  styleUrls: ['./directory.page.scss'],
})
export class DirectoryPage implements OnInit {

  private searchLocations: any;
  private location: any;
  private directory: any;
  private items: any;
  private loadingMore = false;
  private loading = true;
  private chunk: number;
  private itemHeight = 66;

  constructor(
    private vars: VarsService,
    private http: HttpService,
    private toastCtrl: ToastController,
    private changeDetector: ChangeDetectorRef,
    private platform: Platform
  ) {
    this.platform.ready().then(() => {
      this.chunk = Math.ceil((this.platform.height() - 56 - 57) / this.itemHeight); // 56 & 57 are bar height and tabs height
    });
  }

  ngOnInit() {
    this.location = this.vars.defaultLocation;
    this.makeDirectory();
  }

  searchMerchants(search: string) {
    this.items = this.directory.filter((store: any) => {
      return store.dba.toLowerCase().includes(search.toLowerCase()) || store.industry_name.toLowerCase().includes(search.toLowerCase());
    });
  }

  filterLocations(search: string) {
    const searchLocations = this.vars.locations.filter((loc: any) => {
      const combos = [
        loc.city,
        `${loc.city}, ${loc.abbr}`,
        `${loc.city}, ${loc.state}`
      ];
      return combos.some((combo: any) => combo.toLowerCase().includes(search.toLowerCase()));
    }).slice(0, 5);

    // removes odd bug showing last option after clicking
    this.searchLocations = searchLocations[0].city + ', ' + searchLocations[0].abbr === search || !search ? [] : searchLocations;
  }

  setLocation(loc: any) {
    this.location = loc;
    this.searchLocations = [];
    this.makeDirectory();
  }

  makeDirectory() {
    this.loading = true;
    const body = {
      action: 'getDirectory',
      location_id: this.location.location_id
    };
    this.http.getData('directory', body).subscribe((resp: any) => {
      if (resp.status === 1) {
        this.directory = resp.data;
        this.items = this.directory.slice(0, this.chunk);
      } else {
        console.log(resp);
        this.errorToast();
      }
      this.loading = false;
    }, error => {
      console.log(error);
      this.loading = false;
      this.errorToast();
    });
  }

  loadMore(): Promise<any> {
    return new Promise(resolve => {
      if (this.items.length < this.directory.length) {
        this.loadingMore = true;
        const start = this.items.length;
        setTimeout(() => {
          this.items = [...this.items, ...this.directory.slice(start, start + this.chunk)];
          this.loadingMore = false;
          this.changeDetector.detectChanges();
        }, 500);
      }
      resolve();
    });
}

loadStore(store: any) {
  const body = {
    action: 'getStores',
    locationId: this.location.location_id,
    vendorId: store.vendor_id
  };

  this.http.getData('directory', body).subscribe((resp: any) => {
    if (resp.status === 1) {
      console.log(resp.data);
    } else {
      console.log(resp);
      this.errorToast();
    }
  }, error => {
    console.log(error);
    this.errorToast();
  });
}

async errorToast() {
  const toast = await this.toastCtrl.create({
    message: 'There was an error',
    color: 'dark',
    duration: 1500
  });

  await toast.present();
}

}
