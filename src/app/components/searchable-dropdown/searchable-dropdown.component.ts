import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-searchable-dropdown',
  templateUrl: './searchable-dropdown.component.html',
  styleUrls: ['./searchable-dropdown.component.scss'],
})
export class SearchableDropdownComponent implements OnInit, AfterViewInit {

  @Input() options: any;
  @Input() debounce = 300;
  @Input() color: string;
  @Input() placeholder: string;
  @Input() disabled = false;
  @Input() loading = false;

  @Output() updateOptions = new EventEmitter();
  @Output() selectValue = new EventEmitter();

  private loadingString = 'Loading...';
  private value: string;

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    if (this.options && this.options.length === 1) {
      this.updateValue(this.options[0]);
    }
  }

  updateDropdown(event: any) {
    this.updateOptions.emit(event);
  }

  updateValue(item: any) {
    this.value = this.interpretValue(item);
    this.selectValue.emit(item);
  }

  interpretValue(object: any) {
    const keys = Object.keys(object);
    if (keys.includes('city')) { // Location Type
      return `${object.city}, ${object.abbr}`;
    }
    if (keys.includes('feathers') && keys.includes('dba')) { // Wallet Type
      return `${object.dba}${+object.feathers ? ' - ' + object.feathers : ''}`;
    }
    if (keys.includes('merchant_id') && keys.includes('email')) { // Merchant type
      return object.dba;
    }
  }

}
