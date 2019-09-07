import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { ModalController } from '@ionic/angular';
import { VarsService } from 'src/app/services/vars.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit, OnChanges {
  private options: any;
  private wallet: any;
  private amount: number;

  private loading = false;

  @Input() modal = false;
  @Input() wallets: any;
  @Input() value: string;
  @Output() update = new EventEmitter();

  constructor(
    private http: HttpService,
    private modalCtrl: ModalController,
    private vars: VarsService
  ) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    const wallets: SimpleChange = changes.wallets.currentValue;
    this.wallets = wallets;
  }

  setOptions(search?: any) {
    this.options = this.wallets.filter((wallet: any) => {
      if (search && wallet.dba.toLowerCase().search(search.toLowerCase()) > -1) {
        return wallet;
      }
    }).slice(0, 5);

    if (this.options[0] && this.options[0].dba === search || !search) {
      this.options = [];
    }
  }

  setWallet(wallet: any) {
    this.wallet = wallet;
    this.setOptions();
  }

  updateWallet() {
    if (this.modal) {
      this.modalCtrl.dismiss({
        wallet: this.wallet,
        amount: this.amount
      });
    } else {
      this.update.emit({ wallet: this.wallet, amount: this.amount });
    }
  }

}
