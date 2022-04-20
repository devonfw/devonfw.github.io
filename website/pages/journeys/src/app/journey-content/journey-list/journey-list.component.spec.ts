import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneyListComponent } from './journey-list.component';

describe('JourneyListComponent', () => {
  let component: JourneyListComponent;
  let fixture: ComponentFixture<JourneyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JourneyListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JourneyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
