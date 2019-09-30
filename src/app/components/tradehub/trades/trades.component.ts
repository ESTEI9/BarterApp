import { Component, Input, AfterContentInit, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';
import { HttpService } from 'src/app/services/http.service';
import { CommonService } from 'src/app/services/common.service';
import { DetailsComponent } from '../../details/details/details.component';

@Component({
    selector: 'seg-trades',
    templateUrl: './trades.component.html',
    styleUrls: ['./trades.component.scss'],
})
export class TradesComponent implements AfterContentInit {

    @Input() segment: string;
    @Input() data: any = [];

    private loading = false;
    private boxLoading: boolean;

    @Output() update = new EventEmitter();

    constructor(
        private vars: VarsService,
        private http: HttpService,
        private common: CommonService,
        private modalCtrl: ModalController
    ) { }

    ngAfterContentInit() {
        const loadingCheck = setInterval(() => {
            this.boxLoading = this.vars.loading;
            if (!this.boxLoading) {
                clearInterval(loadingCheck);
            }
        }, 100);
    }

    async viewTrade(id: any) {
        const modal = await this.modalCtrl.create({
            component: DetailsComponent,
            componentProps: {id}
        });
        await modal.present();
        modal.onDidDismiss().then(() => {
            this.loadData();
        });
    }

    async loadData() {
        this.loading = true;
        const body = {
            userId: this.vars.userMeta.user_id,
            type: 'Trade',
            segment: this.segment
        };
        await this.http.getData('tradehub', body).subscribe((resp: any) => {
            if (resp.status === 1) {
                if (resp.data.trades) {
                    this.common.addData(this.data, resp.data.trades).then((data1) => {
                        this.common.removeData(data1, resp.data.trades).then((data2) => {
                            this.common.changeData(data2, resp.data.trades).then(() => {
                                this.loading = false;
                            });
                        });
                    });
                    this.update.emit(resp.data.trades);
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
