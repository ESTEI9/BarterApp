import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';
import { ToastController, NavController, AlertController } from '@ionic/angular';
import { cloneDeep } from 'lodash';
import { IntroService } from 'src/app/services/intro.service';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.page.html',
  styleUrls: ['./locations.page.scss'],
})
export class LocationsPage implements OnInit {

  private loading = false;
  private updating = false;
  locations: any;
  private searchLocations: any;
  private deletes = [];
  private newLocation: {
    city: string,
    state: string,
    abbr: string,
    address: string,
    zipcode: number,
    phone: string
  } = {
    city: null,
    state: null,
    abbr: null,
    address: null,
    zipcode: null,
    phone: null
  };

  constructor(
    public vars: VarsService,
    private http: HttpService,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private changeDetector: ChangeDetectorRef,
    private intro: IntroService
  ) {
    this.locations = cloneDeep(this.vars.locationData);
  }

  ngOnInit() {}

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

  deleteLocation(index: number) {
    const body = {
      action: 'delete',
      storeId: this.locations[index].store_id
    };
    this.http.postData('locations', {body: JSON.stringify(body)}).subscribe((resp: any) => {
      if (resp.status === 1) {
        this.toast('Location deleted');
        this.locations = this.locations.filter((loc: any, i: number) => i !== index);
        this.changeDetector.detectChanges();

      } else {
        this.toast('Unable to delete location.');
        console.log(resp);
      }
    }, error => {
      console.log(error);
    });
  }

  createLocation() {
    this.updating = true;
    const body = {
      body: JSON.stringify({
        ...this.newLocation,
        action: 'create',
        userId: this.vars.merchantData.merchant_id
      })
    };
    this.http.postData('locations', body).subscribe((resp: any) => {
      this.updating = false;
      if (resp.status === 1) {
        this.locations.push({...this.newLocation, store_id: resp.store_id});
        this.newLocation = {
          city: null,
          state: null,
          abbr: null,
          address: null,
          zipcode: null,
          phone: null
        };
        if (this.intro.newUser) {
          this.intro.createdLocation();
        } else {
          this.toast('Created a location');
        }
      } else {
        this.toast('Unable to create a location');
        console.log(resp);
      }
      this.updating = false;
    }, error => {
      this.updating = false;
      console.log(error);
    });
  }

  setLocation(loc: any) {
    this.newLocation = loc;
    this.searchLocations = [];
  }

  async deletePrompt(index: number) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Confirmation',
      message: 'Are you sure you want to delete this location?',
      buttons: [{
        text: 'No',
        role: 'cancel'
      }, {
        text: 'Yes',
        handler: () => {
          this.deleteLocation(index);
        }
      }]
    });
    await alert.present();
  }

  async toast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      color: 'dark',
    });

    await toast.present();
  }
}
