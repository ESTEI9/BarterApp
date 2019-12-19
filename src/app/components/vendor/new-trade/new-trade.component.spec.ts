import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTradeComponent } from './new-trade.component';

describe('NewTradeComponent', () => {
  let component: NewTradeComponent;
  let fixture: ComponentFixture<NewTradeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewTradeComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewTradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
