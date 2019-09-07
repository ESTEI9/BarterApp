import { NgModule } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { NewTradeComponent } from './new-trade/new-trade.component';
import { PipesModule } from '../pipes/pipes.module';
import { TradesComponent } from './tradehub/trades/trades.component';
import { InvoicesComponent } from './tradehub/invoices/invoices.component';
import { GiftsComponent } from './tradehub/gifts/gifts.component';
import { TradeComponent } from './details/trade/trade.component';
import { InvoiceComponent } from './details/invoice/invoice.component';
import { GiftComponent } from './details/gift/gift.component';
import { IonMdRefresherComponent } from './ion-md-refresher/ion-md-refresher.component';
import { SearchableDropdownComponent } from './searchable-dropdown/searchable-dropdown.component';
import { DescriptionComponent } from './blocks/description/description.component';
import { WalletComponent } from './blocks/wallet/wallet.component';
import { StartComponent } from './tipay/start/start.component';
import { SendComponent } from './tipay/send/send.component';
import { CompleteComponent } from './tipay/complete/complete.component';
import { HistoryComponent } from './tipay/history/history.component';
import { QRCodeModule } from 'angularx-qrcode';

const components = [
  LoginComponent,
  NewTradeComponent,
  TradesComponent,
  InvoicesComponent,
  GiftsComponent,
  TradeComponent,
  InvoiceComponent,
  GiftComponent,
  IonMdRefresherComponent,
  SearchableDropdownComponent,
  DescriptionComponent,
  WalletComponent,
  StartComponent,
  SendComponent,
  CompleteComponent,
  HistoryComponent
];

@NgModule({
  declarations: components,
  imports: [
      IonicModule,
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
      PipesModule,
      QRCodeModule
  ],
  entryComponents: [DescriptionComponent, WalletComponent, SearchableDropdownComponent],
  providers: [KeyValuePipe],
  exports: components
})
export class ComponentsModule { }
