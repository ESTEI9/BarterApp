import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { LocationsPage } from './locations.page';

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateGuard implements CanDeactivate<LocationsPage> {
  canDeactivate(
    page: LocationsPage
  ): Observable<boolean> | boolean {
    if (page.locations.length < 1) {
      page.toast('You must have at least one location');
      page.vars.currentRoute = '/locations';
      return false;
    } else {
      return true;
    }
  }
}
