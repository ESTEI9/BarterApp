import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { NavController, IonRefresher } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
    selector: 'seg-trades',
    templateUrl: './trades.component.html',
    styleUrls: ['./trades.component.scss'],
})
export class TradesComponent implements OnInit {

    @Input() segment: string;

    private initLoading = true;
    private trades: any;

    constructor(
        private navCtrl: NavController,
        private vars: VarsService,
        private http: HttpService,
        private renderer: Renderer2
    ) { }

    ngOnInit() {
        this.loadTrades().then(() => {
            this.initLoading = false;
        });
    }

    viewTrade(id: any) {
        this.navCtrl.navigateForward('/details/' + id);
    }

    async loadTrades() {
        const body = {
            merchantID: this.vars.merchantData['merchant_id'],
            type: 'Trade',
            segment: this.segment
        };
        await this.http.getData('tradehub', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                this.trades = resp.data.trades;
            } else {
                console.log(resp);
            }
        }, (err: any) => {
            console.log(err);
        });
    }

}
