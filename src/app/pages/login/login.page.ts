import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
    selector: 'page-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

    constructor(
        private menuCtrl: MenuController
    ) { }

    ngOnInit() { }

}
