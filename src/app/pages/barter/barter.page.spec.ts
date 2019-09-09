import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarterPage } from './barter.page';

describe('BarterPage', () => {
  let component: BarterPage;
  let fixture: ComponentFixture<BarterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BarterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
