import { Component, OnInit, Input } from '@angular/core';
import { NavController } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
    selector: 'seg-gifts',
    templateUrl: './gifts.component.html',
    styleUrls: ['./gifts.component.scss'],
})
export class GiftsComponent implements OnInit {

    @Input('segment') segment: string;
    private loading: boolean;
    private gifts: any;

    constructor(
        private navCtrl: NavController,
        private vars: VarsService,
        private http: HttpService
    ) { }

    ngOnInit() {
        this.loadGifts();
    }

    viewTrade(id: any) {
        this.navCtrl.navigateForward('/details/' + id);
    }

    async loadGifts(){
        this.loading = true;
        const body = {
            merchantID: this.vars.merchantData['merchant_id'],
            type: 'Trade',
            segment: this.segment
        };
        await this.http.getData('tradehub', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                this.gifts = resp.data.gifts;
            } else {
                console.log(resp);
            }
            this.loading = false;
        }, (err: any) => {
            console.log("There was an error");
            this.loading = false;
        });
    }

}
