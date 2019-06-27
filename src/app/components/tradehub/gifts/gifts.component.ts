import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChange } from '@angular/core';
import { NavController } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';

@Component({
    selector: 'seg-gifts',
    templateUrl: './gifts.component.html',
    styleUrls: ['./gifts.component.scss'],
})
export class GiftsComponent implements OnInit {

    @Input('gifts') gifts: any;
    @Input('segment') segment: string;
    @Input('loading') loading: boolean;
    @Output('getGifts') getGifts = new EventEmitter<any>();

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

    loadGifts(){
        this.loading = true;
        this.getGifts.emit(true);
    }

}
