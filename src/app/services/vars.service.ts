import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx'

@Injectable({
    providedIn: 'root'
})
export class VarsService {

    public login: string;
    public merchantData: Object = {};

    constructor(
        public nStorage: NativeStorage
    ) {
        if (Object.keys(this.nStorage).length > 0) {
            this.nStorage.getItem('login').then(data => { this.login = (data ? data : null) });
        } else {
            //Testing Only
            this.login = "test@merchant.com";
        }
    }
}
