import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Storage } from '@ionic/storage';

@Injectable({
    providedIn: 'root'
})
export class VarsService {

    public login: string;
    public merchantData: any;
    public locationData: any;
    public defaultLocation: any;
    public loading = true;
    public onInitTrigger: number;
    public locations: any;
    private dev = true;

    constructor(
        public storage: Storage,
        public httpClient: HttpClient
    ) {
        this.getLocations();
        if (this.dev) {
            this.login = 'vendor1@test.com'; // dev
        } else {
            this.storage.get('login').then(
                data  => {
                    this.login = data ? data : null;
                }
            );
        }
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
