import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { NewTradeComponent } from './new-trade/new-trade.component';
import { PipesModule } from '../pipes/pipes.module';
import { TradesComponent } from './tradehub/trades/trades.component';
import { InvoicesComponent } from './tradehub/invoices/invoices.component';
import { GiftsComponent } from './tradehub/gifts/gifts.component';

@NgModule({
  declarations: [
        LoginComponent,
        NewTradeComponent,
        TradesComponent,
        InvoicesComponent,
        GiftsComponent
    ],
  imports: [
      IonicModule,
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
      PipesModule
  ],
  exports: [
      LoginComponent,
      NewTradeComponent,
      TradesComponent,
      InvoicesComponent,
      GiftsComponent
    ]
})
export class ComponentsModule { }
