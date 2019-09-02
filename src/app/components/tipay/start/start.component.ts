import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'tpay-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
})
export class StartComponent implements OnInit {

  @Output() setType = new EventEmitter();

  constructor() { }

  ngOnInit() {}

  nextSlide(slide: string) {
    this.setType.emit(slide);
  }

}
