import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IonMdRefresherComponent } from './ion-md-refresher.component';

describe('IonMdRefresherComponent', () => {
  let component: IonMdRefresherComponent;
  let fixture: ComponentFixture<IonMdRefresherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IonMdRefresherComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IonMdRefresherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
