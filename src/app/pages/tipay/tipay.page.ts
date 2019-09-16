import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-tipay',
  templateUrl: './tipay.page.html',
  styleUrls: ['./tipay.page.scss'],
})
export class TipayPage implements OnInit, AfterViewInit {

  @ViewChild('tpaySlider') slider: IonSlides;

  private segment = 'new';
  private type: string;
  sliderOptions = {
    lockSwipes: true
  };

  constructor() {}

  ngOnInit() { }

  ngAfterViewInit() {
    this.slider.options = this.sliderOptions;
    this.slider.update();
  }

  switchSegment(event: any) {
    this.segment = event.detail.value;
  }

  setType(type: string) {
    this.type = type;
    this.slider.slideNext();
  }

}
