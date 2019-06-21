import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { NewTradeComponent } from './new-trade/new-trade.component';

@NgModule({
  declarations: [
        LoginComponent,
        NewTradeComponent
    ],
  imports: [
      IonicModule,
      FormsModule,
      ReactiveFormsModule,
      CommonModule
  ],
  exports: [LoginComponent, NewTradeComponent]
})
export class ComponentsModule { }
