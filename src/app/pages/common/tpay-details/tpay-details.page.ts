import { Component } from '@angular/core';

@Component({
  selector: 'app-tpay-details',
  templateUrl: './tpay-details.page.html',
  styleUrls: ['./tpay-details.page.scss'],
})
export class TpayDetailsPage {

  private details: any;
  private referrer: string;

  constructor() {
    this.details = history.state.details;
    this.referrer = history.state.referrer;
    if (this.referrer === 'sent') {
      const receivingValu = {yours: this.details.receiving_valu.merchant, merchant: this.details.receiving_valu.yours};
      this.details.receiving_valu = receivingValu;
    }
  }

}
