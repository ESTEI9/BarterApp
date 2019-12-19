import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { CustomerProfilePage } from './customer.page';

@Injectable({
  providedIn: 'root'
})

export class CanDeactivateGuard implements CanDeactivate<CustomerProfilePage> {
  canDeactivate(
    page: CustomerProfilePage
  ): Observable<boolean> | boolean {
    if (!page.name || !page.location || !page.email) {
      page.message('Please fill out all required fields');
      page.vars.currentRoute = '/customer-profile';
      return false;
    } else {
      return true;
    }
  }
}
