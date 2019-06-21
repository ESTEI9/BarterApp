import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides, NavController } from '@ionic/angular';
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
    private isLoading: boolean = false;
    @ViewChild('#slider') slider: IonSlides;
    private sliderOptions: {}
    private rememberMe: boolean = true;

    constructor(
        private vars: VarsService,
        private http: HttpService,
        private navCtrl: NavController
    ) { }

    ngOnInit() {
        this.account.email = this.vars.login;
    }

    doLogin() {
        this.isLoading = true;
        const payload = {...this.account, 'action': 'login'};
        this.http.postData('login', payload).subscribe(async (resp: any) => {
            if (resp.status === 1) {
                if (this.rememberMe && this.account.email != this.vars.login) {
                    this.vars.nStorage.setItem('login', this.account.email);
                }
                this.vars.merchantData = resp.data;
                this.message = null;
                this.navCtrl.navigateRoot('/trade-hub');
            } else {
                this.account.password = '';
                this.message = "Username & password mismatch.";
            }
            this.isLoading = false;
        }, async (err) => {
            this.message = "There was an error. Please try again."
            this.isLoading = false;
        });
    }

}
