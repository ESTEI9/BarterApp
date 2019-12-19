import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-searchable-dropdown',
  templateUrl: './searchable-dropdown.component.html',
  styleUrls: ['./searchable-dropdown.component.scss'],
})
export class SearchableDropdownComponent implements OnChanges {

  @Input() options: any;
  @Input() debounce = 300;
  @Input() color: string = null;
  @Input() placeholder: string;
  @Input() disabled = false;
  @Input() loading = false;
  @Input() modal = false;
  @Input() value: string;
  @Input() toggle = false;

  @Output() updateOptions = new EventEmitter();
  @Output() selectValue = new EventEmitter();

  private loadingString = 'Loading...';

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.options && changes.options.currentValue) {
      this.options = changes.options.currentValue;
    }

    if (changes.toggle && changes.toggle.currentValue) {
      this.toggle = changes.toggle.currentValue;
    }
  }

  preventClear(event: Event) {
    event.preventDefault();
  }

  updateDropdown(event: any) {
    this.toggle = true;
    this.updateOptions.emit(event);
  }

  updateValue(item: any) {
    this.value = this.interpretValue(item);
    this.selectValue.emit(item);
    this.toggle = false;
  }

  interpretValue(object: any) {
    const keys = Object.keys(object);
    if (keys.includes('city')) { // Location Type
      return `${object.city}, ${object.abbr}`;
    }
    if (keys.includes('private_units') && keys.includes('dba')) { // Wallet Type
      return object.dba;
    }
    if (keys.includes('merchant_id') && keys.includes('email')) { // Merchant type
      return object.dba;
    }
  }

}
