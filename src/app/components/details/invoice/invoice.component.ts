import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'det-invoice',
    templateUrl: './invoice.component.html',
    styleUrls: ['./invoice.component.scss'],
})
export class InvoiceComponent implements OnInit {

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
