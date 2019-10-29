import { NgModule } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './common/login/login.component';
import { NewTradeComponent } from './vendor/new-trade/new-trade.component';
import { PipesModule } from '../pipes/pipes.module';
import { TradesComponent } from './vendor/tradehub/trades/trades.component';
import { InvoicesComponent } from './vendor/tradehub/invoices/invoices.component';
import { GiftsComponent } from './vendor/tradehub/gifts/gifts.component';
import { TradeComponent } from './vendor/details/trade/trade.component';
import { InvoiceComponent } from './vendor/details/invoice/invoice.component';
import { GiftComponent } from './vendor/details/gift/gift.component';
import { IonMdRefresherComponent } from './common/ion-md-refresher/ion-md-refresher.component';
import { SearchableDropdownComponent } from './common/searchable-dropdown/searchable-dropdown.component';
import { DescriptionComponent } from './blocks/description/description.component';
import { WalletComponent } from './blocks/wallet/wallet.component';
import { StartComponent } from './tipay/start/start.component';
import { SendComponent } from './tipay/send/send.component';
import { CompleteComponent } from './tipay/complete/complete.component';
import { HistoryComponent } from './tipay/history/history.component';
import { QRCodeModule } from 'angularx-qrcode';
import { EditWalletComponent } from './edit-wallet/edit-wallet.component';
import { DetailsComponent } from './vendor/details/details/details.component';
import { InboxComponent } from './vendor/barter/inbox/inbox.component';
import { OutboxComponent } from './vendor/barter/outbox/outbox.component';
import { ArchivesComponent } from './vendor/barter/archives/archives.component';
import { QRScanner } from '@ionic-native/qr-scanner/ngx';

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
  HistoryComponent,
  EditWalletComponent,
  DetailsComponent,
  InboxComponent,
  OutboxComponent,
  ArchivesComponent
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
  entryComponents: [
    DescriptionComponent,
    WalletComponent,
    SearchableDropdownComponent,
    DetailsComponent,
    InboxComponent,
    OutboxComponent,
    ArchivesComponent
  ],
  providers: [KeyValuePipe, QRScanner],
  exports: components
})
export class ComponentsModule { }
