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
  private tpayLoading = undefined;
  private segment = 'received';

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
      userId: this.vars.userMeta.user_id
    };
    this.http.getData('tpay', body).subscribe(async (resp: any) => {
      if (resp.status === 1) {
        this.history = resp.data;
        this.historyList = resp.data.received;
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
      this.loading = false;
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

  switchSegment() {
    this.segment = this.segment === 'received' ? 'sent' : 'received';
    this.historyList = this.segment === 'received' ? this.history.received : this.history.sent;
  }

  filterHistory() {
    const history = this.segment === 'received' ? this.history.receieved : this.history.sent;
    this.historyList = history.filter(item => {
      return item.dba.toLowerCase().includes(this.historySearch);
    });
  }

  loadDetails(id: number) {
    this.loadingDetails = true;
    this.tpayLoading = id;
    const body = {
      action: 'getDetails',
      tradeId: id
    };
    this.http.getData('tpay', body).subscribe(async (resp: any) => {
      if (resp.status === 1) {
        const extras: NavigationExtras = {
          state: {
            details: resp.data,
            referrer: this.segment
          }
        };
        this.navCtrl.navigateForward(`/tpay/${Math.random().toFixed(5)}/details`, extras);
      } else {
        const toast = await this.toastCtrl.create({
          message: 'There was an error',
          duration: 3000,
          color: 'dark'
        });
        await toast.present();
      }
      this.tpayLoading = null;
    }, async err => {
      this.tpayLoading = null;
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
