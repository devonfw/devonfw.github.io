import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, JourneyData, StepData } from '../../state/app.state';
import { loadStep } from '../../state/steps/step.actions';
import { getStepDataState, findIndexStepExistence, getJourneySection } from '../../state/steps/step.selector';
import { take } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'app-sub-step-detail',
  templateUrl: './sub-step-detail.component.html',
  styleUrls: ['./sub-step-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubStepDetailComponent implements OnInit {

  @Input() sections: any;


  step$: Observable<StepData>;
  index$: Observable<any>;
  journey$: Observable<JourneyData>;

  constructor(private store: Store<AppState>, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    console.log(this.sections.id)
    this.index$ = this.store.select(findIndexStepExistence({ step_id: this.sections.id }))
    this.index$.pipe(take(1)).subscribe(indexData => {
      console.log(indexData)
      if (indexData == -1) {
        this.getSubSections(this.sections)

      }
    })
    this.step$ = this.store.select(getStepDataState)
  }


  getSubSections(data) {
      this.index$ = this.store.select(findIndexStepExistence({ step_id: data.id }))
    this.index$.pipe(take(1)).subscribe(indexData => {
        if (indexData == -1) {
            this.store.dispatch(loadStep({ stepId: data.id }));
        }
      })
    }
  }




