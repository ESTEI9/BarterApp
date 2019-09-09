import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-tipay',
  templateUrl: './tipay.page.html',
  styleUrls: ['./tipay.page.scss'],
})
export class TipayPage implements OnInit {

  @ViewChild('tpaySlider') slider: IonSlides;

  private segment = 'new';
  private type: string;

  constructor() { }

  ngOnInit() {
  }

  switchSegment(event: any) {
    this.segment = event.detail.value;
  }

  setType(type: string) {
    this.type = type;
    this.slider.slideNext();
  }

}
