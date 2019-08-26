import { Component, OnInit, Input, AfterContentInit, EventEmitter, Output } from '@angular/core';
import { NavController } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
    selector: 'seg-gifts',
    templateUrl: './gifts.component.html',
    styleUrls: ['./gifts.component.scss'],
})
export class GiftsComponent implements OnInit, AfterContentInit {

    @Input() segment: string;
    @Input() data: any = [];

    private loading = false;
    private boxLoading: boolean;

    @Output() update = new EventEmitter();

    constructor(
        private navCtrl: NavController,
        private vars: VarsService,
        private http: HttpService,
        private common: CommonService
    ) { }

    ngOnInit() { }

    ngAfterContentInit() {
        const loadingCheck = setInterval(() => {
            this.boxLoading = this.vars.loading;
            if (!this.boxLoading) {
                clearInterval(loadingCheck);
            }
        }, 100);
    }

    viewTrade(id: any) {
        this.navCtrl.navigateForward('/details/' + id);
    }

    async loadData() {
        this.loading = true;
        const body = {
            merchantID: this.vars.merchantData['merchant_id'],
            type: 'Gift',
            segment: this.segment
        };
        await this.http.getData('tradehub', body).subscribe(async (resp: any) => {
            if (resp.status === 1) {
                if (resp.data.gifts) {
                    this.common.addData(this.data, resp.data.gifts).then((data1) => {
                        this.common.removeData(data1, resp.data.gifts).then((data2) => {
                            this.common.changeData(data2, resp.data.gifts).then(() => {
                                this.loading = false;
                            });
                        });
                    });
                    this.update.emit({gifts: resp.data.gifts});
                } else {
                    this.data = [];
                }
            } else {
                console.log(resp);
                this.loading = false;
            }
        }, (err: any) => {
            console.log(err);
            this.loading = false;
        });
    }

}
