import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: `/login/${Math.random().toFixed(5)}`, pathMatch: 'full' },
  { path: `login/:trigger`, loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: `wallet/:trigger`, loadChildren: './pages/wallet/wallet.module#WalletPageModule' },
  { path: 'tpay', loadChildren: './pages/tipay/tipay.module#TipayPageModule' },
  { path: 'tpay/details', loadChildren: './pages/tpay-details/tpay-details.module#TpayDetailsPageModule', pathMatch: 'full'},
  { path: `barter/:trigger`, loadChildren: './pages/barter/barter.module#BarterPageModule' },
  { path: 'profile', loadChildren: './pages/profile/profile.module#ProfilePageModule' }
];

// Trigger present for triggering OnInit. Ionic bug https://github.com/ionic-team/ionic/issues/17853
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
