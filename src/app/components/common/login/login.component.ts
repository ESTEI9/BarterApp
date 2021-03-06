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

    private account: { username: string, password: string } = {
        username: null,
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
        this.storage.get('username').then((username: string) => {
            this.account.username = username ? username : null;
        });
        this.account.password = null;
    }

    doLogin() {
        this.message = null;
        this.isLoading = true;
        const password = btoa(this.account.password);
        const body = {
            username: this.account.username,
            password,
            action: 'login'
        };
        const payload = { body: JSON.stringify(body) };
        this.http.postData('login', payload).subscribe(async (resp: any) => {
            if (resp.status === 1) {
                this.createuserMeta(resp.data.meta).then((canProceed: boolean) => {
                    if (canProceed) {
                        if (this.rememberMe) { this.storage.set('username', this.account.username); }
                        this.vars.getLocations();
                        if (this.vars.userMeta.is_merchant) {
                            this.vars.getIndustries().then(() => {
                                this.vars.locationData = resp.data.locations;
                                this.vars.defaultLocation = resp.data.locations.filter((loc: any) => loc.main)[0];
                                this.pickNavigation();
                            });
                        } else {
                            this.storage.get('defaultLocation').then((data) => {
                                this.vars.defaultLocation = data;
                                this.pickNavigation();
                            });
                        }
                    } else {
                        this.message = 'There was an error. Please try again.';
                        this.isLoading = false;
                    }
                });
            } else {
                this.account.password = '';
                if (resp.code === 'P:LO-01-B') {
                    this.message = 'Username & password mismatch.';
                } else {
                    this.message = 'There was an error. Please try again.';
                }
            }
            this.isLoading = false;
        }, async (err) => {
            this.message = 'There was an error. Please try again.';
            console.log(err);
            this.isLoading = false;
        });
    }

    createuserMeta(data: any) {
        this.vars.userMeta = data;
        this.vars.userMeta.pwd = this.account.password;
        return new Promise(resolve => {
            if (!data.name && this.vars.userMeta.is_merchant) {
                const body = {
                    action: 'create',
                    userId: data.user_id
                };
                this.http.postData('profile', { body: JSON.stringify(body) }).subscribe((resp: any) => {
                    if (resp.status === 1) {
                        const newData = resp.data;
                        this.vars.userMeta = { ...this.vars.userMeta, newData };
                        resolve(true);
                    } else {
                        console.log(resp);
                        resolve(false);
                    }
                }, error => {
                    console.log(error);
                    resolve(false);
                });
            } else {
                resolve(true);
            }
        });
    }

    pickNavigation() {
        if (this.vars.userMeta.is_merchant) {
            if (!this.vars.locationData.length) {
                this.intro.newUser = true;
                this.navCtrl.navigateForward(`/locations/${Math.random().toFixed(5)}`);
            } else {
                if (!this.vars.userMeta.dba) {
                    this.intro.newUser = true;
                    this.navCtrl.navigateForward(`/profile/${Math.random().toFixed(5)}`);
                } else {
                    this.navCtrl.navigateForward(`/barter/${Math.random().toFixed(5)}`);
                }
            }
        } else {
            if (this.vars.defaultLocation) {
                this.vars.locationData = [this.vars.defaultLocation];
                this.navCtrl.navigateForward(`/barter/${Math.random().toFixed(5)}`);
            } else {
                this.intro.newUser = true;
                this.navCtrl.navigateForward(`/customer-profile/${Math.random().toFixed(5)}`);
            }
        }
    }
}
