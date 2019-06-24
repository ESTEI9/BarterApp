import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { NewTradeComponent } from './new-trade/new-trade.component';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  declarations: [
        LoginComponent,
        NewTradeComponent
    ],
  imports: [
      IonicModule,
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
      PipesModule
  ],
  exports: [LoginComponent, NewTradeComponent]
})
export class ComponentsModule { }
