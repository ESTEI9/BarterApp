import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';
import { ToastController } from '@ionic/angular';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-customer-profile',
  templateUrl: './customer.page.html',
  styleUrls: ['./customer.page.scss'],
})
export class CustomerProfilePage implements OnInit {

  private updating = false;
  name: string;
  email: string;
  private searchLocations = [];
  location = [];
  private locationString: string;
  private changeLocation = false;

  constructor(
    private storage: Storage,
    public vars: VarsService,
    private http: HttpService,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.name = this.vars.userMeta.name;
    this.email = this.vars.userMeta.email;
    this.storage.get('defaultLocation').then((data) => {
      this.location = data;
      this.locationString = data ? `${data.city}, ${data.abbr}` : '';
    });
  }

  updateLocation(loc: any) {
    this.location = loc;
    this.locationString = `${loc.city}, ${loc.abbr}`;
    this.vars.locationData = [loc];
    this.storage.set('defaultLocation', loc);
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


  updateProfile() {
    this.updating = true;
    const body = {
      action: 'updateCustomer',
      name: this.name,
      email: this.email,
      userId: this.vars.userMeta.user_id
    };

    this.http.postData('profile', {body: JSON.stringify(body)}).subscribe((resp: any) => {
      this.updating = false;
      if (resp.status === 1) {
        this.vars.userMeta.name = this.name;
        this.vars.userMeta.email = this.email;
        this.message('Profile updated');
      } else {
        console.log(resp);
        this.message('There was an error. Please try again.');
      }
    }, error => {
      console.log(error);
      this.message('There was an error. Please try again.');
    });
  }

  async message(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      color: 'dark'
    });
    await toast.present();
  }

}
