import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';
import { ToastController, NavController, AlertController } from '@ionic/angular';
import { cloneDeep } from 'lodash';

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
    private changeDetector: ChangeDetectorRef
  ) {
    this.locations = cloneDeep(this.vars.locationData);
  }

  ngOnInit() {
    if (!this.locations || !this.locations.length) {
      this.vars.newUserPagesVisited.push('locations');
      this.initPrompt();
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
        this.toast('Created a location');
        this.locations.push({...this.newLocation, store_id: resp.store_id});
        this.newLocation = {
          city: null,
          state: null,
          abbr: null,
          address: null,
          zipcode: null,
          phone: null
        };
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

  async initPrompt() {
    const alert = await this.alertCtrl.create({
      header: 'Setup Bot',
      message: `Hi! I'm a guide to help you get started. Before we begin, there are some things we need to do.`,
      buttons: [{
        text: 'Sure',
        handler: () => {
          this.requiredPrompt();
        }
      }]
    });
    await alert.present();
  }

  async requiredPrompt() {
    const alert = await this.alertCtrl.create({
      header: 'Setup Bot',
      message: `Our system relies upon you having at least one location.<br/><br/>Please create one, after that, I'll reach back out.`,
      buttons: [{
        text: 'Got it'
      }]
    });
    await alert.present();
  }

  async step2Prompt() {
    const alert = await this.alertCtrl.create({
      header: 'Setup Bot',
      message: `Awesome! Remember, you must always have at least one location. Let's finish your profile.`,
      buttons: [{
        text: 'OK',
        handler: () => {
          this.navCtrl.navigateForward(`/profile/${Math.random().toFixed(5)}`);
        }
      }]
    });
    await alert.present();
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
