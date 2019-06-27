import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChange, ElementRef, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';

@Component({
    selector: 'seg-trades',
    templateUrl: './trades.component.html',
    styleUrls: ['./trades.component.scss'],
})
export class TradesComponent implements OnInit {

    @Input('trades') trades: any;
    @Input('segment') segment: string;
    @Input('loading') loading: boolean;
    @Output('getTrades') getTrades = new EventEmitter<any>();

    constructor(
        private navCtrl: NavController,
        private vars: VarsService
    ) { }

    ngOnInit() {
        this.loading = false;
    }

    ngOnChanges(changes: {[loading: string]: SimpleChange}) {
        if(changes.loading){
            this.loading = changes.loading.currentValue;
        }
    }

    viewTrade(id: any) {
        this.navCtrl.navigateForward('/details/' + id);
    }

    loadTrades(){
        this.loading = true;
        this.getTrades.emit(true);
    }

}
