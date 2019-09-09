import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'inbox', loadChildren: './pages/inbox/inbox.module#InboxPageModule' },
  { path: 'outbox', loadChildren: './pages/outbox/outbox.module#OutboxPageModule' },
  { path: 'archives', loadChildren: './pages/archives/archives.module#ArchivesPageModule'},
  { path: 'wallet', loadChildren: './pages/wallet/wallet.module#WalletPageModule' },
  { path: 'tpay', loadChildren: './pages/tipay/tipay.module#TipayPageModule' },
  { path: 'tpay/details', loadChildren: './pages/tpay-details/tpay-details.module#TpayDetailsPageModule', pathMatch: 'full'}

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
