import { Component } from '@angular/core';

import { Platform, MenuController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { VarsService } from './services/vars.service';
import { Router, Event, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  private currentRoute: string;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private menuCtrl: MenuController,
    private router: Router,
    private navCtrl: NavController,
    private vars: VarsService
  ) {
    this.initializeApp();
    this.menuCtrl.enable(false, 'barter');
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.vars.currentRoute = event.url;
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  navTo(route: string) {
    this.navCtrl.navigateRoot(`${route}/${Math.random().toFixed(5)}`);
  }

  openMore() {
    this.menuCtrl.enable(true, 'more').then(() => {
      this.menuCtrl.open('more');
    });
  }

  closeMore() {
    this.menuCtrl.close('more');
  }
}
