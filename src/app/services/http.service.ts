import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { KeyValuePipe } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    private url = 'https://www.cometothex.com/api/barter/demo/'; // sandbox
    // private url = 'https://www.cometothex.com/api/barter/'; // live

    constructor(
        private http: HttpClient,
        private keyValue: KeyValuePipe
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

    deleteWallet(id: string) {
        const params = new HttpParams().set('valu_id', id);
        return this.http.get('https://www.cometothex.com/unitimarket/wp-json/wallet-update/v1/remove_on_sell/',
            {headers: { 'Content-Type': 'application/x-www-form-urlencoded'}, params}
        );
    }

    createWallet(data: any) {
        const params = new HttpParams({fromObject: data});
        return this.http.get('https://www.cometothex.com/unitimarket/wp-json/wallet-update/v1/sell/',
            {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, params}
        );
    }
}
