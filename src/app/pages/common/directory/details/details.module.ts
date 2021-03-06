import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DetailsPage } from './details.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { EsriProvider } from 'leaflet-geosearch';
import { Device } from '@ionic-native/device/ngx';

const routes: Routes = [
  {
    path: '',
    component: DetailsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    RouterModule.forChild(routes)
  ],
  providers: [EsriProvider, Device],
  declarations: [DetailsPage]
})
export class DetailsPageModule {}
