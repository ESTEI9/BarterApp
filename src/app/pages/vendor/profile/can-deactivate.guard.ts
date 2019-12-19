import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { ProfilePage } from './profile.page';

@Injectable({
  providedIn: 'root'
})

export class CanDeactivateGuard implements CanDeactivate<ProfilePage> {
  canDeactivate(
    page: ProfilePage
  ): Observable<boolean> | boolean {
    if ((!page.dba || !page.location) || !page.updated) {
      page.message('Please fill out all required fields');
      page.vars.currentRoute = '/profile';
      return false;
    } else {
      return true;
    }
  }
}
