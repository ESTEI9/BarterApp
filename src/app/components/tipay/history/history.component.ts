import { Component, OnInit } from '@angular/core';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';
import { ToastController, NavController } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'tpay-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {

  private historySearch: string;
  private history: any;
  private historyList: any;
  private loading = false;
  private loadingDetails = false;

  constructor(
    private vars: VarsService,
    private http: HttpService,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.getHistory();
  }

  getHistory() {
    this.loading = true;
    const body = {
      action: 'getHistory',
      merchantId: this.vars.merchantData.merchant_id
    };
    this.http.getData('history', body).subscribe(async (resp: any) => {
      if (resp.status === 1) {
        this.history = resp.data;
        this.historyList = resp.data;
      } else {
        const toast = await this.toastCtrl.create({
          message: 'Cannot Get History',
          duration: 3000,
          color: 'dark'
        });
        await toast.present();
      }
      this.loading = false;
    }, async err => {
      console.log(err);
      this.loading = false;
      const toast = await this.toastCtrl.create({
        message: 'There was an error',
        duration: 3000,
        color: 'dark'
      });
      await toast.present();
    });
  }

  filterHistory() {
    this.historyList = this.history.filter(item => {
      return item.dba.toLowerCase().includes(this.historySearch);
    });
  }

  loadDetails(id: number) {
    this.loadingDetails = true;
    const body = {
      action: 'loadDetails',
      tradeId: id
    };
    this.http.getData('history', body).subscribe(async (resp: any) => {
      if (resp.status === 1) {
        const extras: NavigationExtras = {
          state: {
            details: resp.data
          }
        };
        this.navCtrl.navigateForward('/tpay/details', extras);
      } else {
        const toast = await this.toastCtrl.create({
          message: 'There was an error',
          duration: 3000,
          color: 'dark'
        });
        await toast.present();
      }
    }, async err => {
      console.log(err);
      const toast = await this.toastCtrl.create({
        message: 'There was an error',
        duration: 3000,
        color: 'dark'
      });
      await toast.present();
    });
  }

}
