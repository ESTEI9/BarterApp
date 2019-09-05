import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { ToastController } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';

@Component({
  selector: 'tpay-complete',
  templateUrl: './complete.component.html',
  styleUrls: ['./complete.component.scss'],
})
export class CompleteComponent implements OnInit {

  private code: any;
  private amount: any;
  private merchant: any = {
    id: null,
    dba: null
  };
  private precode: string;
  private tid: any;

  private completed = false;
  private loading = false;
  private running = false;

  @Output() goBack = new EventEmitter();

  constructor(
    private http: HttpService,
    private toastCtrl: ToastController,
    private vars: VarsService
  ) { }

  ngOnInit() {}

  lookup() {
    this.loading = true;
    const body = {
      action: 'getTpay',
      code: this.precode
    };
    this.http.getData('tpay', body).subscribe(async (resp: any) => {
      if (resp.status === 1) {
        if (resp.data) {
          this.code = this.precode;
          this.merchant = {
            id: resp.data.giving_user_id,
            dba: resp.data.dba
          };
          this.tid = resp.data.trade_id;
          this.amount = resp.data.receiving_valu;
        } else {
          const toast = await this.toastCtrl.create({
            message: 'No Tpay associated with this code',
            duration: 2000,
            color: 'dark'
          });
          await toast.present();
        }
      } else {
        console.log(resp);
        this.errorToast();
      }
      this.loading = false;
    }, (err) => {
      console.log(err);
      this.loading = false;
      this.errorToast();
    });
  }

  complete() {
    this.running = true;
    const body = {
      action: 'complete',
      userId: this.vars.merchantData.merchant_id,
      tradeId: this.tid,
      merchantId: this.merchant.id
    };
    const payload = {body: JSON.stringify(body)};
    this.http.postData('tpay', payload).subscribe((resp: any) => {
      if (resp.status === 1) {
        this.completed = true;
      } else {
        console.log(resp);
        this.errorToast();
      }
      this.running = false;
    }, err => {
      this.running = false;
      console.log(err);
      this.errorToast();
    });
  }

  cancel() {
    this.clearData();
    this.goBack.emit();
  }

  clearData() {
    this.completed = false;
    this.code = null;
    this.amount = null;
    this.merchant = {
      dba: null,
      id: null
    };
    this.precode = null;
  }

  async errorToast() {
    const toast = await this.toastCtrl.create({
      message: 'There was an error. Please try again.',
      duration: 3000,
      color: 'dark'
    });
    return await toast.present();
  }

}
