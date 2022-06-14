import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubStepDetailComponent } from './sub-step-detail.component';

describe('SubStepDetailComponent', () => {
  let component: SubStepDetailComponent;
  let fixture: ComponentFixture<SubStepDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubStepDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubStepDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
