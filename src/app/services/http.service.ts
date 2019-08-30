import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    private url = 'https://www.cometothex.com/api/barter/demo/'; // sandbox
    // private url = 'https://www.cometothex.com/api/barter/'; // live
    // private url = 'http://localhost/gynesus/api/barter/'; // dev server

    constructor(
        private http: HttpClient
    ) { }

    getData(route: string, body: object) {
        const params = new HttpParams().set('route', route).set('body', JSON.stringify(body));
        return this.http.get(this.url, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, params});
    }

    postData(route: string, body: any) {
        body = {...body, route};
        let payload = '';
        Object.keys(body).map((param: string) => {
            const amp = (param === 'route') ? '' : '&';
            payload += encodeURIComponent(param) + '=' + encodeURIComponent(body[param]) + amp;
        });
        return this.http.post(this.url, payload, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
    }
}
