import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';
import { ToastController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-market',
  templateUrl: './market.page.html',
  styleUrls: ['./market.page.scss'],
})
export class MarketPage implements OnInit {

  @ViewChild('frame') frame: ElementRef;
  private loading = true;
  private error = false;

  constructor(
    private vars: VarsService,
    private http: HttpService,
    private toastCtrl: ToastController,
    private iab: InAppBrowser,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.wpLogin();
  }

  wpLogin() {
    const browserOptions = 'clearcache=yes,location=no,zoom=no';
    const browser = this.iab.create('https://tryuniti.com/unitimarket/login', '_blank', browserOptions);
    browser.hide();
    this.loading = true;

    const loadstart = browser.on('loadstart').subscribe(event => {
      if (event.url.search('my-account') > -1) {
        browser.executeScript({ code: `window.location = 'https://tryuniti.com/unitimarket/'` });
      }
    });

    const loadstop = browser.on('loadstop').subscribe(event => {
      if (event.url.search('login') > -1) {
        browser.executeScript({
          code:
            `
          document.getElementById('iump_login_username').value = '${this.vars.userMeta.email}';
          document.getElementById('iump_login_password').value = '${this.vars.userMeta.pwd}';
          document.getElementById('ihc_login_form').submit();
          `
        });
      }
      if (event.url === 'https://tryuniti.com/unitimarket/') {
        browser.show();
        this.loading = false;
        this.changeDetector.detectChanges();
        loadstart.unsubscribe();
        loadstop.unsubscribe();
      }
    }, error => {
      console.log(error);
    });
  }

  async errorToast() {
    const toast = await this.toastCtrl.create({
      message: 'There was an error loading the shop',
      duration: 2000,
      color: 'danger',
      position: 'top'
    });

    return await toast.present();
  }

}
