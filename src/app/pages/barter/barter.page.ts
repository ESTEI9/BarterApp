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

  ngOnDestroy() {
  }

}
