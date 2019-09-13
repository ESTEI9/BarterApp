import { Component, OnInit } from '@angular/core';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';
import { ToastController } from '@ionic/angular';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  dba: string;
  location: any;
  private locations: any;
  private updating = false;
  updated = false;
  private locationString: string;
  private industryId: any;
  private website: string;

  constructor(
    public vars: VarsService,
    private http: HttpService,
    private toastCtrl: ToastController
  ) {
    this.dba = this.vars.merchantData.dba;
    this.industryId = this.vars.merchantData.industry_id;
    this.website = this.vars.merchantData.website || '';
    this.location = this.vars.locationData ? this.vars.locationData.filter((loc: any) => loc.main === '1')[0] : null;
    this.locationString = `${this.location.city}, ${this.location.abbr}`;
    this.locations = cloneDeep(this.vars.locationData);
  }

  ngOnInit() {
    if (this.dba && this.location.length) {
      this.updated = true;
    } else {
      this.message('Please fill all fields before proceeding');
    }
  }

  searchLocations(search: string) {
    const searchLocations = this.vars.locationData.filter((loc: any) => {
      const options = [
        loc.city,
        loc.state,
        `${loc.city}, ${loc.abbr}`,
        `${loc.city},${loc.abbr}`,
        `${loc.city}, ${loc.state}`,
        `${loc.city},${loc.state}`,
      ];
      for (const option of options) {
        if (option.toLowerCase().includes(search.toLowerCase())) {
            return loc;
        }
    }
    }).slice(0, 5);

    // removes odd bug showing last option after clicking
    this.locations = searchLocations[0].city + ', ' + searchLocations[0].abbr === search || !search ? [] : searchLocations;
  }

  updateLocation(location: any) {
    this.location = location;
  }

  updateIndustry(id: any) {
    this.industryId = id;
  }

  updateData() {
    this.updating = true;
    if (!this.location && !this.dba) {
      this.message('Please fill out all required fields');
      this.updating = false;
    } else {
      const body = {
        body: JSON.stringify({
          action: 'update',
          userId: this.vars.merchantData.merchant_id,
          storeId: this.location.store_id,
          dba: this.dba,
          industryId: this.industryId,
          website: this.website
        })
      };
      this.http.postData('profile', body).subscribe(async (resp: any) => {
        if (resp.status === 1) {
          this.updated = true;
          const toast = await this.toastCtrl.create({
            message: 'Profile updated',
            duration: 1500,
            color: 'highlight'
          });
          await toast.present();
        } else {
          this.errorToast();
        }
        this.updating = false;
      }, err => {
        this.updating = false;
        console.log(err);
        this.errorToast();
      });
    }
  }

  errorToast() {
    this.message('There was an error');
  }

  async message(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      color: 'dark',
      duration: 2000
    });
    await toast.present();
  }

}
