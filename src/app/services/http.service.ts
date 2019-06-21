import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    private url: string = "http://www.cometothex.com/api/barter/";

    constructor(
        private http: HttpClient
    ) { }

    getData(route: string, body:object){
        let params = new HttpParams().set('route', route).set('body', JSON.stringify(body));
        return this.http.get(this.url, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, params: params});
    }

    postData(route: string, body:object){
        body = {...body, 'route': route};
        let payload = "";
        for (let param in body) {
            let amp = (param === 'route') ? "" : "&";
            payload += encodeURIComponent(param)+"="+encodeURIComponent(body[param])+amp;
        }
        return this.http.post(this.url, payload, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
    }
}
