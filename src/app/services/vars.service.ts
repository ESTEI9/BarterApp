import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router, NavigationStart, Event } from '@angular/router';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class VarsService {

    public merchantData: any;
    public locationData: any;
    public defaultLocation: any;
    public loading = true;
    public onInitTrigger: number;
    public locations: any;
    public currentRoute: string;
    public industries: Array<object>;

    public newUser = false;
    public newUserPagesVisited = [];
    private newUserPages = ['barter', 'tpay', 'locations', 'profile', 'wallet'];

    constructor(
        private httpClient: HttpClient,
        private http: HttpService,
        public router: Router
    ) {
        this.newUserPages = this.newUserPages.sort();
        this.newUserPagesVisited = this.newUserPagesVisited.sort();
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

    getIndustries() {
        const body = {
            action: 'getIndustries'
        };
        return new Promise(resolve =>
            this.http.getData('details', body).subscribe((resp: any) => {
                if (resp.status === 1) {
                    this.industries = resp.industries;
                } else {
                    console.log(resp);
                }
                resolve();
            }, err => {
                console.log(err);
            })
        );
    }
}
