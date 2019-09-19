import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-barter',
  templateUrl: './barter.page.html',
  styleUrls: ['./barter.page.scss'],
})
export class BarterPage implements OnInit, OnDestroy {

  private segment = 'inbox';

  constructor(
    private menuCtrl: MenuController
  ) { }

  ngOnInit() {
  }

  switchSegment(newSegment: string) {
    this.segment = newSegment;
  }

  toggleMenu() {
    this.menuCtrl.enable(true, 'barter');
    this.menuCtrl.isEnabled('barter').then(isEnabled => {
      if (isEnabled) {
        this.menuCtrl.enable(false, 'more');
        this.menuCtrl.enable(true, 'barter').then(() => {
          this.menuCtrl.open('barter');
        });
      } else {
        this.menuCtrl.close('barter').then(() => {
          this.menuCtrl.enable(false, 'barter');
          this.menuCtrl.enable(true, 'more');
        });
      }
    });
  }

  ngOnDestroy() {
  }

}
