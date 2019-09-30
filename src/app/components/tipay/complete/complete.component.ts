import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { ToastController, AlertController } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';

@Component({
  selector: 'tpay-complete',
  templateUrl: './complete.component.html',
  styleUrls: ['./complete.component.scss'],
})
export class CompleteComponent implements OnInit {

  private precode: any;
  private code: any;
  private amount: any;
  private amountDue: any;
  private merchant: any = {
    id: null,
    dba: null
  };
  private tid: any;

  private completed = false;
  private stillDue = false;
  private loading = false;
  private running = false;

  @Output() goBack = new EventEmitter();

  constructor(
    private http: HttpService,
    private toastCtrl: ToastController,
    private vars: VarsService,
    private alertCtrl: AlertController,
    private scanner: QRScanner,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() { }

  qrLookup() {
    this.scanner.prepare().then(async (status: QRScannerStatus) => {
      if (status.authorized) {
        this.toggleScanner('open');
        const scan = this.scanner.scan().subscribe((code: string) => {
          this.precode = code;
          this.toggleScanner('close').then(() => {
            this.lookup();
            scan.unsubscribe();
          });
        });
      } else if (status.denied) {
        const alert = await this.alertCtrl.create({
          header: 'Allow Camera Access',
          message: 'Please allow this app to access your camera.',
          buttons: [
            { text: 'Cancel', role: 'cancel' },
            {
              text: 'OK', handler: () => {
                this.scanner.openSettings();
              }
            }
          ]
        });
        await alert.present();
      } else {
        const alert = await this.alertCtrl.create({
          header: 'Notice',
          message: 'You must allow this app to access your camera to scan the code',
          buttons: [{ text: 'OK' }]
        });
        await alert.present();
      }
    }).catch((error: any) => {
      console.log(error);
      this.errorToast();
    });
  }


  toggleScanner(direction: string) {
    return new Promise(resolve => {
      if (direction === 'open') {
        const rootElement = document.getElementsByTagName('html')[0];
        rootElement.classList.add('scanner-open');
      } else {
        const rootElement = document.getElementsByTagName('html')[0];
        rootElement.classList.remove('scanner-open');
      }
      this.scanner.getStatus().then((status: any) => {
        if (status.showing) {
          this.scanner.destroy();
          this.changeDetector.detectChanges();
        } else {
          this.scanner.useBackCamera();
          this.scanner.show();
        }
        resolve();
      });
    });
  }

  lookup() {
    if (this.precode.length === 6) {
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
  }

  complete() {
    this.running = true;
    const body = {
      action: 'complete',
      userId: this.vars.userMeta.user_id,
      tradeId: this.tid,
      merchantId: this.merchant.id,
      recIsMerchant: this.vars.userMeta.is_merchant
    };
    const payload = { body: JSON.stringify(body) };
    this.http.postData('tpay', payload).subscribe((resp: any) => {
      if (resp.status === 1) {
        if (resp.data.amountDue) {
          this.amountDue = +resp.data.amountDue.toFixed(2);
          if (+this.amount === +resp.data.amountDue.toFixed(2)) {
            this.stillDue = true;
            this.altPaymentPrompt();
          } else {
            this.dueToast();
          }
          this.stillDue = true;
        } else {
          this.completed = true;
        }
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

  check() {
    this.running = true;
    const body = {
      action: 'check',
      tradeId: this.tid
    };
    this.http.postData('tpay', { body: JSON.stringify(body) }).subscribe((resp: any) => {
      if (resp.status === 1) {
        switch (resp.data.status) {
          case 'Completed':
            this.stillDue = false;
            this.completed = true;
            this.changeDetector.detectChanges();
            break;
          case 'Canceled':
            this.cancelToast();
            this.cancel();
            break;
          default:
            this.dueToast();
        }
      } else {
        console.log(resp);
        this.errorToast();
      }
      this.running = false;
    }, error => {
      this.running = false;
      console.log(error);
      this.errorToast();
    });
  }

  cancel() {
    this.clearData();
    this.goBack.emit();
  }

  clearData() {
    this.stillDue = false;
    this.completed = false;
    this.code = null;
    this.precode = null;
    this.amount = null;
    this.amountDue = false;
    this.merchant = {
      dba: null,
      id: null
    };
  }

  async errorToast() {
    const toast = await this.toastCtrl.create({
      message: 'There was an error. Please try again.',
      duration: 3000,
      color: 'dark'
    });
    return await toast.present();
  }

  async dueToast() {
    const toast = await this.toastCtrl.create({
      message: 'Please pay the remainder.',
      duration: 2000,
      color: 'highlight',
      position: 'bottom'
    });
    await toast.present();
  }

  async cancelToast() {
    const toast = await this.toastCtrl.create({
      message: 'Transaction canceled',
      duration: 1500,
      color: 'dark',
      position: 'bottom'
    });
    await toast.present();
  }

  async altPaymentPrompt() {
    const alert = await this.alertCtrl.create({
      header: 'No Units',
      message: `You have no units in your wallet for this merchant.<br/><br/>
      Please provide another form of payment.`,
      buttons: [{ text: 'OK' }]
    });
    await alert.present();
  }

}
