import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    private base = 'https://unyti.org/api';

    // private url = 'https://www.cometothex.com/api/barter/demo/'; // sandbox
    private api = `${this.base}/barter/`; // live


    constructor(
        private http: HttpClient
    ) { }

    getData(route: string, body: object) {
        const params = new HttpParams().set('route', route).set('body', JSON.stringify(body));
        return this.http.get(this.api, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, params});
    }

    postData(route: string, body: any) {
        body = {...body, route};
        let payload = '';
        Object.keys(body).map((param: string) => {
            const amp = (param === 'route') ? '' : '&';
            payload += encodeURIComponent(param) + '=' + encodeURIComponent(body[param]) + amp;
        });
        return this.http.post(this.api, payload, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
    }

    deleteWallet(id: string) {
        const params = new HttpParams().set('valu_id', id);
        return this.http.get(`${this.base}/wp-json/wallet-update/v1/remove_on_sell/`,
            {headers: { 'Content-Type': 'application/x-www-form-urlencoded'}, params}
        );
    }

    createWallet(data: any) {
        const params = new HttpParams({fromObject: data});
        return this.http.get(`${this.base}/wp-json/wallet-update/v1/sell/`,
            {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, params}
        );
    }

    createMyPublic(data: any) {
        const params = new HttpParams({fromObject: data});
        return this.http.get(`${this.base}/wp-json/wallet-update/v1/sell_my_value/`,
            {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, params}
        );
    }

    wpMarketLogin(info: any) {
        const params = new HttpParams({fromObject: info});
        return this.http.post(`${this.base}/login`,
            {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, params}
        );
    }
}
