import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'trade', loadChildren: './pages/trade/trade.module#TradePageModule' },
  { path: 'trade-hub', loadChildren: './pages/trade-hub/trade-hub.module#TradeHubPageModule' },
  { path: 'details/:id', loadChildren: './pages/details/details.module#DetailsPageModule', pathMatch: 'full'}
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
