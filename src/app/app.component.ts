import { Component } from '@angular/core';

import { Platform, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router, NavigationStart, Event } from '@angular/router';

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
    private router: Router
  ) {
    this.initializeApp();
    this.menuCtrl.enable(true, 'primary');
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.currentRoute = event.url;
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
