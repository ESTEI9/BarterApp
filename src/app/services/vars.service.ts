import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { HttpService } from './http.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class VarsService {

    public login: string;
    public merchantData: any;
    public loading = true;
    public locations: any;

    constructor(
        public nStorage: NativeStorage,
        public httpClient: HttpClient
    ) {
        if (Object.keys(this.nStorage).length > 0) {
            this.nStorage.getItem('login').then(data => { this.login = (data ? data : null); });
        } else {
            // Testing Only
            this.login = 'support@freedomchoiceglobal.com'; // dev
            // this.login = 'jedmondson848@yahoo.com'; // live dev
        }
        this.getLocations();
    }

    getLocations() {
        this.httpClient.get('./assets/cities.json').subscribe((resp: any) => {
            this.locations = this.locations = resp;
        });
    }

    // Takes upwards of 15 seconds...

    // getDbLocations() {
    //     const body = {
    //         action: 'getLocations'
    //     };

    //     this.http.getData('locations', body).subscribe((resp: any) => {
    //         if (resp.status === 1) {
    //             const data = Object.values(resp.data);
    //             console.log(data);
    //             return data;
    //         } else {
    //             console.log(resp);
    //         }
    //     }, (err) => {
    //         console.log(err);
    //     });
    // }
}
