import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { VarsService } from 'src/app/services/vars.service';

@Component({
  selector: 'tpay-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
})
export class StartComponent implements OnInit {

  @Output() setType = new EventEmitter();

  constructor(
    private vars: VarsService
  ) { }

  ngOnInit() {}

  nextSlide(slide: string) {
    this.setType.emit(slide);
  }

}
