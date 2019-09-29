import { Injectable } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { isEqual } from 'lodash';
import { VarsService } from './vars.service';
import { Router, Event, NavigationStart } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class IntroService {

  public newUser = false;
  public newUserPagesVisited = [];
  private newUserPages = ['barter', 'tpay', 'locations', 'profile', 'wallet'];

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private router: Router,
    private vars: VarsService
  ) {
    this.newUserPages = this.newUserPages.sort();
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
          if (this.newUser) {
              this.newPageCtrl(event.url.split('/')[1]);
          }
      }
  });
  }

  newPageCtrl(page: string) {
    if (!this.newUserPagesVisited.includes(page)) {
      switch (page) {
        case 'customer-profile':
          this.newUserPagesVisited.push('profile');
          break;
        default:
          this.newUserPagesVisited.push(page);
      }
    }
    this.newUserPagesVisited = this.newUserPagesVisited.sort();

    switch (page) {
      case 'locations':
        this.vars.locationData ? this.locIntro() : this.locInit();
        break;
      case 'profile':
      case 'customer-profile':
        this.profileInit();
        break;
      case 'barter':
        this.barterIntro();
        break;
      case 'tpay':
        this.tpayIntro();
        break;
      case 'wallet':
        this.walletIntro();
    }
  }

  checkFinishedTutorial() {
    if (this.newUser && isEqual(this.newUserPagesVisited, this.newUserPages)) {
      this.newUser = false;
      this.completePrompt();
    }
  }

  async completePrompt() {
    const alert = await this.alertCtrl.create({
      header: 'Setup Bot',
      message: `Great! You've finished this basic intro!<br/><br/>
      If you have more questions, feel free to consult our knowledge base.`,
      buttons: [{ text: 'OK' }]
    });
    await alert.present();
  }

  // Step 1: Locations Page

  async locInit() {
    const alert = await this.alertCtrl.create({
      header: 'Setup Bot',
      message: `Hi! I'm a guide to help you get started. Before we begin, there are some things we need to do.`,
      buttons: [{
        text: 'Sure',
        handler: () => {
          this.locRequired();
        }
      }]
    });
    await alert.present();
  }

  async locRequired() {
    const alert = await this.alertCtrl.create({
      header: 'Setup Bot',
      message: `Our system relies upon you having at least one location.<br/><br/>
      Please create one, after that, I'll reach back out.`,
      buttons: [{
        text: 'Got it'
      }]
    });
    await alert.present();
  }

  async createdLocation() {
    const alert = await this.alertCtrl.create({
      header: 'Setup Bot',
      message: `Awesome! Remember, you must always have at least one location. Let's finish your profile.`,
      buttons: [{
        text: 'OK',
        handler: () => {
          this.navCtrl.navigateForward(`/profile/${Math.random().toFixed(5)}`);
        }
      }]
    });
    await alert.present();
  }

  async locIntro() {
    const alert = await this.alertCtrl.create({
      header: 'Intro Bot',
      message: `These are your stores. Here, you can add and delete stores.<br/><br/>
      This is important so that you can be found within the cooperative!`,
      buttons: [{text: 'OK'}]
    });
    await alert.present();
    alert.onDidDismiss().then(() => {
      this.checkFinishedTutorial();
    });
  }

  // Step 2: Profile Page

  async profileInit() {
    let message = !this.newUserPagesVisited.includes('locations') ? `Hi! I'm a guide to help you get started.<br/><br/>` : '';
    message += `Some items are required (*) to be found in the cooperative. Please fill them out before we move on.`;
    if (!this.vars.userMeta.is_merchant) { this.newUserPagesVisited.push('locations'); }

    const alert = await this.alertCtrl.create({
      header: 'Setup Bot',
      message,
      buttons: [{
        text: 'OK'
      }]
    });
    await alert.present();
  }

  async profileFinish() {
    const alert = await this.alertCtrl.create({
      header: 'Setup Bot',
      message: `You can always come back and update this stuff later. Filling it out will help you be found in the cooperative!`,
      buttons: [{
        text: 'OK',
        handler: () => {
          this.navCtrl.navigateRoot(`barter/${Math.random().toFixed(5)}`);
        }
      }]
    });
    await alert.present();
  }

  // Step 3: Barter Page

  async barterIntro() {
    const alert = await this.alertCtrl.create({
      header: 'Intro Bot',
      message: 'Welcome to the barter page! Here, you can manage all your trades, gifts, and invoices.',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.play();
        }
      }]
    });
    await alert.present();
  }

  async play() {
    const alert = await this.alertCtrl.create({
      header: 'Intro Bot',
      message: `Go ahead and look around! When you move on to another page, I'll reach out.`,
      buttons: [{text: 'Great'}]
    });
    await alert.present();
  }

  // TPay Page

  async tpayIntro() {
    const alert = await this.alertCtrl.create({
      header: 'Intro Bot',
      message: `This is TPay, where you can start or complete a transaction.<br/><br/>
      To complete one, enter in the code that's given when starting one.`,
      buttons: [{text: 'OK'}]
    });
    await alert.present();
    alert.onDidDismiss().then(() => {
      this.checkFinishedTutorial();
    });
  }

  // Wallet Page

  async walletIntro() {
    const alert = await this.alertCtrl.create({
      header: 'Intro Bot',
      message: `This is your wallet. Here, you view all your units for merchants that you own.<br/><br/>
      You can click on an entry to manage or view details.`,
      buttons: [{text: 'OK'}]
    });
    await alert.present();
    alert.onDidDismiss().then(() => {
      this.checkFinishedTutorial();
    });
  }
}
