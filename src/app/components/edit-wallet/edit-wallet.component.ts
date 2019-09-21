import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController, NavParams } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';
import { cloneDeep, isEqual } from 'lodash';

@Component({
  selector: 'app-edit-wallet',
  templateUrl: './edit-wallet.component.html',
  styleUrls: ['./edit-wallet.component.scss'],
})
export class EditWalletComponent implements OnInit {

  // Inputs
  private vendorId: number;
  private location: any;
  private private: number;
  private public: number;

  private privateCount: number;
  private publicCount: number;

  private wallet: any;
  private newWallet: any;
  private totalValu: number;
  private loading = false;
  private editable = false;
  private createPackage = false;

  private newItems: any = [];

  private newAmount: number;
  private newPrice: any;
  private newSalePrice: any;

  private toRemove = 0; // Temporary until modded API to not update private wallet

  constructor(
    private modalCtrl: ModalController,
    private vars: VarsService,
    private http: HttpService,
    private toastCtrl: ToastController,
    private navParams: NavParams
  ) {
    this.vendorId = this.navParams.data.vendorId;
    this.location = this. navParams.data.location;
    this.private = +this.navParams.data.private;
    this.public = +this.navParams.data.public;
    this.privateCount = +this.private;
    this.publicCount = +this.public;
    this.totalValu = +(+this.privateCount + +this.publicCount).toFixed(2);
  }

  ngOnInit() {
    this.loadWallets();
  }

  loadWallets() {
    this.loading = true;
    const body = {
      action: 'getWallets',
      userId: this.vars.userMeta.user_id,
      vendorId: this.vendorId,
      location: this.location
    };
    this.http.getData('wallet', body).subscribe((resp: any) => {
      if (resp.status === 1) {
        this.wallet = cloneDeep(resp.data);
        this.newWallet = cloneDeep(this.wallet);
      } else {
        console.log(resp);
        this.errorToast();
      }
      this.loading = false;
    }, err => {
      this.loading = false;
      console.log(err);
      this.errorToast();
    });
  }

  toggleEdit() {
    this.editable = !this.editable;
    if (!this.editable) {
      this.privateCount = this.vendorId === this.vars.userMeta.user_id && this.privateCount < 0
        ? 0
        : +(this.totalValu - this.publicCount).toFixed(2);
    }
  }

  updateTotalCount() {
      this.totalValu = +(+this.publicCount + +this.privateCount).toFixed(2);
  }

  updatePublicCount(units: number, i: number) {
    const diff = +this.newWallet[i].units - units;
    this.publicCount = +(this.publicCount - diff).toFixed(2);
    this.newWallet[i].units = units;
  }

  updatePrice(newPrice: any, i: number, sale?: string) {
    sale ? this.newWallet[i]._sale_price = newPrice : this.newWallet[i]._regular_price = newPrice;
  }

  async createPublicUnits() {
    if (this.newAmount && this.newPrice) {
      this.newWallet.push({
        units: this.newAmount,
        _regular_price: this.newPrice,
        _sale_price: this.newSalePrice || null
      });
      const sum = +(+this.privateCount - +this.newAmount).toFixed(2);
      const fakeSum = +(+this.toRemove - +this.newAmount).toFixed(2);
      this.privateCount = this.vendorId === this.vars.userMeta.user_id ? sum > 0 ? sum : 0 : sum;
      this.toRemove = this.vendorId === this.vars.userMeta.user_id ? fakeSum > 0 ? fakeSum : 0 : fakeSum;
      this.newAmount = null;
      this.newPrice = null;
      this.newSalePrice = null;
      this.createPackage = false;
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Fill all fields',
        duration: 1500,
        color: 'dark',
        position: 'top'
      });
      await toast.present();
    }
  }

  deleteItem(i: number) {
    this.privateCount = +(+this.privateCount + +this.newWallet[i].units).toFixed(2);
    this.toRemove = +this.toRemove + +this.newWallet[i].units;
    this.updatePublicCount(0, i);
    this.newWallet = this.newWallet.filter((wallet: any, index: number) => i !== index);
  }

  updateWallet() {
    const newRows = this.newWallet.filter((item: any) => !item.valu_id);
    const walletIds = this.newWallet.map((item: any) => item.valu_id);
    const deleteRows = this.wallet.filter((item: any) => walletIds.indexOf(item.valu_id) === -1);
    const modRows = this.newWallet.filter((item: any, i: number) => {if (item.valu_id) { return !isEqual(item, this.wallet[i]); }});
    this.modalCtrl.dismiss({
      private: +(+this.privateCount - +this.toRemove).toFixed(2),
      changes: {new: newRows, delete: deleteRows, mod: modRows}
    });
  }

  async errorToast() {
    const toast = await this.toastCtrl.create({
      message: 'There was an error',
      duration: 2000,
      color: 'dark',
      position: 'top'
    });
    return await toast.present();
  }

}
