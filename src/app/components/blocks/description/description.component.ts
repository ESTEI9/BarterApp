import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss'],
})
export class DescriptionComponent implements OnInit, AfterViewInit {

  @Input() description = '';
  @Input() title = '';

  @Output() update = new EventEmitter();

  private compDescription: string;
  private compTitle: string;
  private descriptionLeft: number;
  private titleLeft: number;

  constructor() { }

  ngOnInit() {
    this.compDescription = this.description;
    this.compTitle = this.title;
  }

  ngAfterViewInit() {
    this.compDescription = this.description;
    this.compTitle = this.title;
  }

  checkDescriptionLength(length: any) {
    const description = this.compDescription;
    this.descriptionLeft = 500 - length;
    if (this.descriptionLeft <= 0) {
      this.compDescription = description;
    }
    this.update.emit({description: this.compDescription});
  }

  checkTitleLength(length: any) {
    const title = this.compTitle;
    this.titleLeft = 255 - length;
    if (this.titleLeft <= 0) {
      this.compTitle = title;
    }
    this.update.emit({title: this.compTitle});
  }

}
