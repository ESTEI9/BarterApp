import { Component, OnInit} from '@angular/core';
import { MenuController, AlertController } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';

@Component({
  selector: 'app-barter',
  templateUrl: './barter.page.html',
  styleUrls: ['./barter.page.scss'],
})
export class BarterPage implements OnInit {

  private segment = 'inbox';

  constructor(
    private menuCtrl: MenuController,
    private vars: VarsService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    if (this.vars.newUser && !this.vars.newUserPagesVisited.includes('barter')) {
      this.intro();
    }
  }

  switchSegment(newSegment: string) {
    this.segment = newSegment;
  }

  toggleMenu() {
    this.menuCtrl.isOpen('barter').then((isOpen: boolean) => {
      isOpen ? this.menuCtrl.close('barter') : this.menuCtrl.open('barter');
    });
  }

  async intro() {
    this.vars.newUserPagesVisited.push('barter');
    const alert = await this.alertCtrl.create({
      header: 'Setup Bot',
      message: 'Welcome to the barter page! Here, you can manage all your trades, gifts, and invoices.',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.playAlert();
        }
      }]
    });
    await alert.present();
  }

  async playAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Setup Bot',
      message: `Go ahead and look around! When you move on to another page, I'll reach out.`,
      buttons: [{text: 'Great'}]
    });
    await alert.present();
  }

}
