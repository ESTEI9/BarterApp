import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'det-trade',
    templateUrl: './trade.component.html',
    styleUrls: ['./trade.component.scss'],
})
export class TradeComponent implements OnInit {

    @Input('data') trade: any;
    @Input('myDetails') myDetails: any;
    @Input('details') details: any;
    @Input('loading') loading: boolean;
    @Input('referrer') referrer: any;

    @Output('addValu') addValu = new EventEmitter();

    constructor() { }

    ngOnInit() {
        this.loading = false;
    }

    selectValu() {
        this.loading = true;
        this.addValu.emit(true);
    }

}
