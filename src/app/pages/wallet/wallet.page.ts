import { Component, OnInit, Renderer2 } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { VarsService } from 'src/app/services/vars.service';
import { ModalController, ToastController } from '@ionic/angular';
import { EditWalletComponent } from 'src/app/components/edit-wallet/edit-wallet.component';

@Component({
    selector: 'app-wallet',
    templateUrl: './wallet.page.html',
    styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {

    private loading: boolean;
    private updatingWallet: any;
    private locations: any;
    private location: any;
    private locationSearch: string;
    private wallets: any = [];
    private tradeType: string;
    private searchLocations: any;
    private locPlaceholder = '';
    private message: string;

    constructor(
        private http: HttpService,
        private vars: VarsService,
        private modalCtrl: ModalController,
        private toastCtrl: ToastController,
        private renderer: Renderer2
    ) { }

    ngOnInit() {
        this.vars.locationData.filter((loc: any) => {
            if (loc.city === this.vars.merchantData.city && loc.state === this.vars.merchantData.state) {
                this.location = loc;
                this.locPlaceholder = `${loc.city}, ${loc.abbr}`;
                this.loading = true;
                this.loadWallets();
            }
        });
    }

    loadWallets() {
        const body = {
            action: 'getWalletCounts',
            location: this.location,
            merchantId: this.vars.merchantData.merchant_id
        };
        this.http.getData('wallet', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                this.wallets = resp.data;
            } else {
                console.log(resp);
                this.errorToast();
            }
            this.loading = false;
        }, (err: any) => {
            console.log(err);
            this.errorToast();
            this.loading = false;
        });
    }

    filterLocations(search: string) {
        const searchLocations = this.vars.locations.filter((loc: any) => {
          const combos = [
            loc.city,
            `${loc.city}, ${loc.abbr}`,
            `${loc.city}, ${loc.abbr}`
          ];
          for (const option of combos) {
            if (option.toLowerCase().search(search.toLowerCase()) > -1) {
              return loc;
            }
          }
        }).slice(0, 5);

        // removes odd bug showing last option after clicking
        return searchLocations[0].city + ', ' + searchLocations[0].abbr === search || !search ? [] : searchLocations;
      }

      updateSearchLocations(event: any) {
        const searchLocations = this.filterLocations(event.detail.value);
        this.searchLocations = searchLocations;
      }

    setLocation(loc: any) {
        this.locationSearch = `${loc.city}, ${loc.abbr}`;
        this.locPlaceholder = this.locationSearch;
        this.location = loc;
        this.searchLocations = [];
        this.loading = true;
        this.loadWallets();
    }

    async editWalletModal(wallet: any, i: number, event: any) {
        const modal = await this.modalCtrl.create({
            component: EditWalletComponent,
            componentProps: {
                vendorId: wallet.vendor_id,
                location: this.location,
                private: wallet.private_units,
                public: wallet.public_units
            }
        });
        await modal.present();
        modal.onDidDismiss().then((resp: any) => {
            this.updatingWallet = i;
            this.renderer.addClass(event.target, 'disabled');
            this.editWallets(wallet, resp.data).then(async () => {
                this.message = null;
                this.renderer.removeClass(event.target, 'disabled');
                this.updatingWallet = null;
                const toast = await this.toastCtrl.create({
                    message: 'Update complete',
                    duration: 1500,
                    color: 'dark'
                });
                await toast.present();
                toast.onDidDismiss().then(() => {
                    this.loadWallets();
                });
            });
        });
    }

    editWallets(wallet: any, data: any) {
        return new Promise(resolve => {
            this.message = 'Starting update...';
            this.updatePrivate(wallet, data.private).then((resp: boolean) => {
                if (resp) {
                    this.updateWallets(data.changes.mod);
                    // this.addWallets(wallet, data.changes.new);
                    // this.deleteWallets(data.changes.delete).then(() => {
                    //     resolve(true);
                    // });
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    updatePrivate(wallet: any, units: any) {
        this.message = 'Updating private entry...';
        const body = {
            action: 'updatePrivate',
            valu_id: wallet.private_wallet_id,
            units
        };
        return new Promise(resolve =>
            this.http.postData('wallet', {body: JSON.stringify(body)}).subscribe(async (resp: any) => {
                if (resp.status !== 1) {
                    console.log(resp);
                    const toast = await this.toastCtrl.create({
                        message: 'Unable to update private wallet',
                        duration: 2000,
                        color: 'dark'
                    });
                    await toast.present();
                    resolve(false);
                }
                resolve(true);
            }, err => {
                console.log(err);
                this.errorToast();
                resolve(false);
            })
        );
    }

    updateWallets(modData: any) {
        this.message = 'Updating current sale entries...';
        modData.map((data: any, i: number) => {
            const body = {
                action: 'updateWallet',
                valu_id: data.valu_id,
                units: data.units
            };
            this.http.postData('wallet', {body: JSON.stringify(body)}).subscribe(async (resp: any) => {
                if (resp.status === 0) {
                    console.log(resp);
                    if (i + 1 === modData.length) {
                        const toast = await this.toastCtrl.create({
                            message: 'Could not update some entries',
                            duration: 2000,
                            color: 'dark'
                        });
                        await toast.present();
                    }
                }
            }, err => {
                console.log(err);
                this.errorToast();
            });
        });
    }

    addWallets(wallet: any, addData: any) {
        this.message = 'Adding new entries...';
        addData.map((data: any, i: number) => {
            const body = {
                user_id: this.vars.merchantData.merchant_id,
                vendor_id: wallet.vendor_id,
                amt_to_be_remove: data.units,
                regular_price: data._regular_price,
                sale_price: data._sale_price
            };
            this.http.createWallet(body).subscribe(async (resp: any) => {
                if (!resp.success) {
                    console.log(resp.message, {data: body});
                    if (i + 1 === addData.length) {
                        const toast = await this.toastCtrl.create({
                            message: 'Unable to create some entries',
                            duration: 2000,
                            color: 'dark'
                        });
                        await toast.present();
                    }
                }
            }, err => {
                console.log(err);
                this.errorToast();
            });
        });
    }

    deleteWallets(delData: any) {
        this.message = 'Deleting old entries...';
        return new Promise(resolve => {
            const promises = delData.map((data: any, i: number) => {
                this.http.deleteWallet(data.valu_id).subscribe(async (resp: any) => {
                    if (!resp.success) {
                        console.log(resp.message, {id: data.wallet_id});
                        if (i + 1 === delData.length) {
                            const toast = await this.toastCtrl.create({
                                message: 'Unable to delete some entries',
                                duration: 2000,
                                color: 'dark'
                            });
                            return await toast.present();
                        }
                    }
                }, err => {
                    console.log(err);
                    this.errorToast();
                });
            });
            Promise.all(promises).then(() => {
                resolve();
            });
        });
    }

    async errorToast() {
        const toast = await this.toastCtrl.create({
            message: 'There was an error',
            duration: 2000,
            color: 'dark'
        });
        await toast.present();
    }

}
