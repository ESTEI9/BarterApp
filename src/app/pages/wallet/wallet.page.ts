import { Component, OnInit, Renderer2 } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { VarsService } from 'src/app/services/vars.service';
import { ModalController, ToastController } from '@ionic/angular';
import { EditWalletComponent } from 'src/app/components/edit-wallet/edit-wallet.component';
import { cloneDeep } from 'lodash';

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
    private walletList: any;
    private tradeType: string;
    private searchLocations: any;
    private locPlaceholder = '';
    private message: string;
    private updateLocation = false;

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
                this.makeWallets();
            }
        });
    }

    makeWallets() {
        this.loadWallets().then((resp: any) => {
            this.wallets = resp;
            this.walletList = cloneDeep(this.wallets);
        });
    }

    loadWallets() {
        const body = {
            action: 'getWalletCounts',
            location: this.location,
            merchantId: this.vars.merchantData.merchant_id
        };
        return new Promise(resolve =>
            this.http.getData('wallet', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                resolve(resp.data);
            } else {
                console.log(resp);
                this.errorToast();
            }
            this.loading = false;
        }, (err: any) => {
            console.log(err);
            this.errorToast();
            this.loading = false;
            resolve(false);
        }));
    }

    filterList(search: string) {
        this.walletList = this.wallets.filter((wallet: any) => wallet.dba.toLowerCase().includes(search.toLowerCase()));
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
        this.updateLocation = false;
        this.makeWallets();
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
            this.editWallets(wallet, resp.data).then(async (updated: boolean) => {
                if (updated) {
                    this.message = null;
                    this.renderer.removeClass(event.target, 'disabled');
                    this.updatingWallet = null;
                    const toast = await this.toastCtrl.create({
                        message: 'Update complete',
                        duration: 1500,
                        color: 'highlight',
                        position: 'top'
                    });
                    await toast.present();
                    toast.onDidDismiss().then(() => {
                        this.makeWallets();
                    });
                }
            });
        });
    }

    editWallets(wallet: any, data: any) {
        return new Promise(resolve => {
            this.message = 'Starting update...';
            this.updatePrivate(wallet, data.private).then((resp: boolean) => {
                if (resp
                    && this.updateWallets(data.changes.mod)
                    && this.addWallets(wallet, data.changes.new)
                    && this.deleteWallets(data.changes.delete)) {
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
            this.http.postData('wallet', { body: JSON.stringify(body) }).subscribe(async (resp: any) => {
                if (resp.status === 0) {
                    console.log(resp);
                    const toast = await this.toastCtrl.create({
                        message: 'Unable to update private wallet',
                        duration: 2000,
                        color: 'dark',
                        position: 'top'
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

    async updateWallets(modData: any) {
        this.message = 'Updating entries...';
        const promises = modData.map((data: any, i: number) => {
            return new Promise(resolve => {
                const body = {
                    action: 'updateWallet',
                    valu_id: data.valu_id,
                    units: data.units
                };
                this.http.postData('wallet', { body: JSON.stringify(body) }).subscribe(async (resp: any) => {
                    if (resp.status === 0) {
                        console.log(resp);
                        if (i + 1 === modData.length) {
                            const toast = await this.toastCtrl.create({
                                message: 'Could not update some entries',
                                duration: 2000,
                                color: 'dark'
                            });
                            await toast.present();
                            resolve(false);
                        }
                    }
                }, err => {
                    console.log(err);
                    this.errorToast();
                    resolve(false);
                });
            });
        });
        return await Promise.all(promises).then(() => {
            return true;
        }).catch(err => {
            console.log(err);
            return false;
        });
    }

    async addWallets(wallet: any, addData: any) {
        this.message = 'Adding new entries...';
        const promises = addData.map((data: any, i: number) => {
            let body = {};
            let subscription: any;
            if (wallet.vendor_id !== this.vars.merchantData.merchant_id) {
                body = {
                    user_id: this.vars.merchantData.merchant_id,
                    vendor_id: wallet.vendor_id,
                    amt_to_be_remove: data.units,
                    regular_price: data._regular_price,
                    sale_price: data._sale_price
                };

                subscription = this.http.createWallet(body);
            } else {
                body = {
                    self_user_id: wallet.vendor_id,
                    self_value_price: data.units,
                    self_regular_price: data._regular_price,
                    self_sale_price: data._sale_price
                };
                subscription = this.http.createMyPublic(body);
            }
            return new Promise(resolve =>
                subscription.subscribe(async (resp: any) => {
                    if (resp.result !== true) {
                        if (i + 1 === addData.length) {
                            const toast = await this.toastCtrl.create({
                                message: 'Unable to create some entries',
                                duration: 2000,
                                color: 'dark'
                            });
                            await toast.present();
                            resolve(false);
                        }
                    }
                }, (err: any) => {
                    console.log(err);
                    this.errorToast();
                    resolve(false);
                }));
        });
        return await Promise.all(promises).then(() => {
            return true;
        }).catch(err => {
            console.log(err);
            return false;
        });
    }

    async deleteWallets(delData: any) {
        this.message = 'Deleting old entries...';
        const promises = delData.map((data: any, i: number) => {
            return new Promise(resolve => {
                this.http.deleteWallet(data.valu_id).subscribe(async (resp: any) => {
                    if (resp.result !== true) {
                        console.log(resp.message, { id: data.wallet_id });
                        if (i + 1 === delData.length) {
                            const toast = await this.toastCtrl.create({
                                message: 'Unable to delete some entries',
                                duration: 2000,
                                color: 'dark'
                            });
                            await toast.present();
                            resolve(false);
                        }
                    }
                }, err => {
                    console.log(err);
                    this.errorToast();
                    resolve(false);
                });
            });
        });
        return await Promise.all(promises).then(() => {
            return true;
        }).catch(err => {
            console.log(err);
            return false;
        });
    }

    async errorToast() {
        const toast = await this.toastCtrl.create({
            message: 'There was an error',
            duration: 2000,
            color: 'dark',
            position: 'top'
        });
        await toast.present();
    }

}
