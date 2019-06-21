import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeHubPage } from './trade-hub.page';

describe('TradeHubPage', () => {
  let component: TradeHubPage;
  let fixture: ComponentFixture<TradeHubPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TradeHubPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeHubPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
