import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: `/login/${Math.random().toFixed(5)}`, pathMatch: 'full' },
  { path: `login/:trigger`, loadChildren: './pages/common/login/login.module#LoginPageModule' },
  { path: `wallet/:trigger`, loadChildren: './pages/wallet/wallet.module#WalletPageModule' },
  { path: 'tpay/:trigger', loadChildren: './pages/tipay/tipay.module#TipayPageModule' },
  { path: 'tpay/:trigger/details', loadChildren: './pages/common/tpay-details/tpay-details.module#TpayDetailsPageModule', pathMatch: 'full'},
  { path: `barter/:trigger`, loadChildren: './pages/vendor/barter/barter.module#BarterPageModule' },
  { path: 'profile/:trigger', loadChildren: './pages/vendor/profile/profile.module#ProfilePageModule' },
  { path: 'locations/:trigger', loadChildren: './pages/vendor/locations/locations.module#LocationsPageModule' },
  { path: 'customer-profile/:trigger', loadChildren: './pages/customer/profile/customer.module#CustomerProfilePageModule' },
  { path: 'market', loadChildren: './pages/common/market/market.module#MarketPageModule' },
  { path: 'directory/:trigger', loadChildren: './pages/common/directory/directory.module#DirectoryPageModule' },
  { path: 'directory-details/:trigger', loadChildren: './pages/common/directory/details/details.module#DetailsPageModule' }
];

// Trigger present for triggering OnInit. Ionic bug https://github.com/ionic-team/ionic/issues/17853
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
