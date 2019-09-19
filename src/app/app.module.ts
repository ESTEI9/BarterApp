import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';
import { LoginComponent } from './components/login/login.component';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { HttpClientModule } from '@angular/common/http';
import { NewTradeComponent } from './components/new-trade/new-trade.component';
import { IonicStorageModule } from '@ionic/storage';
import { EditWalletComponent } from './components/edit-wallet/edit-wallet.component';
import { IntroService } from './services/intro.service';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [
      LoginComponent,
      NewTradeComponent,
      EditWalletComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    ComponentsModule,
    HttpClientModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    StatusBar,
    SplashScreen,
    NativeStorage,
    IntroService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
