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
    this.menuCtrl.enable(true, 'barter');
  }

  switchSegment(newSegment: string) {
    this.segment = newSegment;
  }

  toggleMenu() {
    this.menuCtrl.isOpen('barter').then((isOpen: boolean) => {
      if (isOpen) {
        this.menuCtrl.close('barter').then(() => {
          this.menuCtrl.enable(true, 'more');
        });
      } else {
        this.menuCtrl.open('barter').then(() => {
          this.menuCtrl.enable(false, 'more');
        });
      }
    });
  }

  ngOnDestroy() {
  }

}
