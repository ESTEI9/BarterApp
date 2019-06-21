import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

    private tradeId: number;

  constructor(
      private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.tradeId = this.route.params['id'];
    console.log(this.route.params);
  }

}
