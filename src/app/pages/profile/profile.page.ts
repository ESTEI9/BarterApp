import { Component, OnInit } from '@angular/core';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';
import { ToastController, AlertController, NavController } from '@ionic/angular';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  private locations: any;
  private updating = false;
  updated = false;
  private locationString: string;
  private changeLocation = false;
  private changeIndustry = false;
  private addLocation = false;

  private searchLocations = [];

  dba: string;
  location: any;
  private industry: any;
  private website: string;
  private accPhone: any;

  constructor(
    public vars: VarsService,
    private http: HttpService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {
    this.dba = this.vars.merchantData.dba;
    this.industry = { name: this.vars.merchantData.industry, industry_id: this.vars.merchantData.industry_id };
    this.website = this.vars.merchantData.website;
    this.accPhone = this.vars.merchantData.phone;
    this.location = this.vars.locationData ? this.vars.locationData.filter((loc: any) => loc.main === '1')[0] : null;
    this.locationString = this.location ? `${this.location.city}, ${this.location.abbr}` : null;
    this.locations = cloneDeep(this.vars.locationData);
  }

  ngOnInit() {
    if (this.dba && this.location) {
      this.updated = true;
    } else {
      this.updateAlert();
    }
  }

  async updateAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Update Your Profile',
      message: 'Some items are required (*) and must be updated before you can access the rest of the app.',
      buttons: [{
        text: 'OK'
      }]
    });

    await alert.present();
  }

  searchMyLocations(search: string) {
    const locations = this.vars.locationData.filter((loc: any) => {
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
    this.locations = locations[0].city + ', ' + locations[0].abbr === search || !search ? [] : locations;
  }

  searchIndustries(search: string) {
    this.vars.industries.filter((industry: any) => industry.name.toLowerCase().includes(search.toLowerCase()));
  }

  changePrimary(location: any) {
    this.location = location;
  }

  updateIndustry(id: any) {
    this.industry = this.vars.industries.find((industry: any) => industry.industry_id === id);
  }

  updateData() {
    this.updating = true;
    if (!this.location && !this.dba) {
      this.message('Please fill out all required fields');
      this.updating = false;
    } else {
      const body = {
          action: 'update',
          userId: this.vars.merchantData.merchant_id,
          dba: this.dba,
          industryId: this.industry.industry_id,
          website: this.website,
          accPhone: this.accPhone,
          main: this.location.store_id,
      };

      this.http.postData('profile', {body: JSON.stringify(body)}).subscribe(async (resp: any) => {
        if (resp.status === 1) {
          this.updated = true;
          const toast = await this.toastCtrl.create({
            message: 'Profile updated',
            duration: 1500,
            color: 'highlight',
            position: 'top'
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
