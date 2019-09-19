import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';
import { Storage } from '@ionic/storage';
import { IntroService } from 'src/app/services/intro.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

    private account: { email: string, password: string } = {
        email: null,
        password: null
    };
    private message: string;
    private isLoading = false;
    private rememberMe = true;

    constructor(
        private vars: VarsService,
        private http: HttpService,
        private navCtrl: NavController,
        private storage: Storage,
        private intro: IntroService
    ) { }

    ngOnInit() {
        this.storage.get('email').then((email: string) => {
            this.account.email = email ? email : null;
        });
        this.account.password = null;
    }

    doLogin() {
        this.message = null;
        this.isLoading = true;
        const password = btoa(this.account.password);
        const body = {
            email: this.account.email,
            password,
            action: 'login'
        };
        const payload = { body: JSON.stringify(body) };
        this.http.postData('login', payload).subscribe(async (resp: any) => {
            if (resp.status === 1) {
                this.createMerchantData(resp.data.meta).then((canProceed: boolean) => {
                    if (canProceed) {
                        if (this.rememberMe) { this.storage.set('email', this.account.email); }
                        this.vars.getLocations();
                        this.vars.getIndustries().then(() => {
                            this.vars.locationData = resp.data.locations;
                            this.vars.defaultLocation = resp.data.locations.filter((loc: any) => loc.main)[0];
                            if (!resp.data.locations.length) {
                                this.intro.newUser = true;
                                this.navCtrl.navigateForward(`/locations/${Math.random().toFixed(5)}`);
                            } else {
                                if (!resp.data.meta.dba) {
                                    this.intro.newUser = true;
                                    this.navCtrl.navigateForward(`/profile/${Math.random().toFixed(5)}`);
                                }
                                if (resp.data.meta.dba && resp.data.locations.length) {
                                    this.navCtrl.navigateForward(`/barter/${Math.random().toFixed(5)}`);
                                }
                            }
                        });
                    } else {
                        this.message = 'There was an error. Please try again.';
                        this.isLoading = false;
                    }
                });
            } else {
                this.account.password = '';
                this.message = 'Username & password mismatch.';
            }
            this.isLoading = false;
        }, async (err) => {
            this.message = 'There was an error. Please try again.';
            console.log(err);
            this.isLoading = false;
        });
    }

    createMerchantData(data: any) {
        this.vars.merchantData = data;
        return new Promise(resolve => {
            if (!data.name) {
                const body = {
                    action: 'create',
                    userId: data.merchant_id
                };
                this.http.postData('profile', { body: JSON.stringify(body) }).subscribe((resp: any) => {
                    if (resp.status === 1) {
                        const newData = resp.data;
                        this.vars.merchantData = { ...this.vars.merchantData, newData };
                        resolve(true);
                    } else {
                        console.log(resp);
                        resolve(false);
                    }
                }, error => {
                    console.log(error);
                    resolve(false);
                });
            }
        });
    }
}
