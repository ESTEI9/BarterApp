import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { ToastController, AlertController } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';

@Component({
  selector: 'tpay-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss'],
})
export class SendComponent implements OnInit {

  @Output() goBack = new EventEmitter();

  private code: string;
  private loading = false;
  private running = false;
  private completed = false;
  private showCode = false;
  private amount: any;
  private id: number;

  constructor(
    private http: HttpService,
    private toastCtrl: ToastController,
    private vars: VarsService,
    private alertCtrl: AlertController,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {}

  create() {
    this.code = null;
    this.loading = true;
    const body = {
      action: 'create',
      userId: this.vars.userMeta.user_id,
      amount: this.amount
    };
    const payload = {body: JSON.stringify(body)};
    this.http.postData('tpay', payload).subscribe((resp: any) => {
      if (resp.status === 1) {
        this.code = resp.data.code;
        this.id = resp.data.id;
      } else {
        console.log(resp);
        this.errorToast();
      }
      this.loading = false;
    }, async (err) => {
      this.loading = false;
      console.log(err);
      this.errorToast();
    });
  }

  check() {
    this.running = true;
    const body = {
      action: 'getStatus',
      id: this.id
    };
    this.http.getData('tpay', body).subscribe(async (resp: any) => {
      if (resp.status === 1) {
        if (['Completed', 'Canceled'].includes(resp.data.status)) {
          this.completed = true;
        } else {
          this.completed = false;
          const toast = await this.toastCtrl.create({
            message: 'Tpay not complete',
            duration: 2000
          });
          await toast.present();
        }
      } else {
        console.log(resp);
        this.errorToast();
      }
      this.running = false;
    }, (err) => {
      this.running = false;
      console.log(err);
      this.errorToast();
    });
  }

  async askComplete() {
    const alert = await this.alertCtrl.create({
      header: 'Mark Complete',
      message: 'Are you sure you want to mark this complete?',
      buttons: [{
        text: 'No',
        role: 'cancel'
      }, {
        text: 'Yes',
        handler: () => {
          this.markComplete();
        }
      }]
    });
    return await alert.present();
  }

  markComplete() {
    this.running = true;
    const body = {
      action: 'markComplete',
      tradeId: this.id,
      status: 'Completed'
    };
    this.http.postData('tpay', {body: JSON.stringify(body)}).subscribe((resp: any) => {
      if (resp.status === 1) {
        this.completed = true;
      } else {
        console.log(resp);
        this.errorToast();
      }
      this.running = false;
      this.changeDetector.detectChanges();
    }, error => {
      this.running = false;
      this.changeDetector.detectChanges();
      console.log(error);
      this.errorToast();
    });
  }

  clearData() {
    this.code = null;
    this.loading = false;
    this.running = false;
    this.completed = false;
    this.amount = null;
  }

  async errorToast() {
    const toast = await this.toastCtrl.create({
      message: 'There was an error. Please try again.',
      duration: 3000,
      color: 'dark'
    });
    return await toast.present();
  }

  cancelTransaction() {
    return new Promise(resolve => {
      if (this.id) {
        const body = {
          action: 'cancel',
          tradeId: this.id
        };
        this.http.postData('tpay', {body: JSON.stringify(body)}).subscribe((resp: any) => {
          if (resp.status === 1) {
            resolve(true);
          } else {
            console.log(resp);
            resolve(false);
          }
        }, error => {
          console.log(error);
          resolve(false);
        });
      } else {
        resolve(true);
      }
    });
  }

  cancel() {
    this.clearData();
    this.cancelTransaction().then((canCancel: boolean) => {
      if (canCancel) {
        this.goBack.emit();
      } else {
        this.errorToast();
      }
    });
  }

}
