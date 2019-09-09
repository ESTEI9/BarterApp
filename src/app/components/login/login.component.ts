import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';

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
        private navCtrl: NavController
    ) { }

    ngOnInit() {
        this.account.email = this.vars.login;
        this.account.password = null;
    }

    doLogin() {
        this.isLoading = true;
        const password = btoa(this.account.password);
        const body = {
            email: this.account.email,
            password,
            action: 'login'
        };
        const payload = {body: JSON.stringify(body)};
        this.http.postData('login', payload).subscribe(async (resp: any) => {
            if (resp.status === 1) {
                if (this.rememberMe && this.account.email !== this.vars.login) {
                    this.vars.storage.set('login', this.account.email);
                }
                this.vars.merchantData = resp.data.meta;
                this.vars.locationData = resp.data.locations;
                this.vars.defaultLocation = resp.data.locations.filter((loc: any) => loc.main)[0];
                this.message = null;
                this.navCtrl.navigateForward(`/barter/${Math.random().toFixed(5)}`);
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
}
