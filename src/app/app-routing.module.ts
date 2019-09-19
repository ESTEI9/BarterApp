import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: `/login/${Math.random().toFixed(5)}`, pathMatch: 'full' },
  { path: `login/:trigger`, loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: `wallet/:trigger`, loadChildren: './pages/wallet/wallet.module#WalletPageModule' },
  { path: 'tpay/:trigger', loadChildren: './pages/tipay/tipay.module#TipayPageModule' },
  { path: 'tpay/:trigger/details', loadChildren: './pages/tpay-details/tpay-details.module#TpayDetailsPageModule', pathMatch: 'full'},
  { path: `barter/:trigger`, loadChildren: './pages/barter/barter.module#BarterPageModule' },
  { path: 'profile/:trigger', loadChildren: './pages/profile/profile.module#ProfilePageModule' },
  { path: 'locations/:trigger', loadChildren: './pages/locations/locations.module#LocationsPageModule' }

];

// Trigger present for triggering OnInit. Ionic bug https://github.com/ionic-team/ionic/issues/17853
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
