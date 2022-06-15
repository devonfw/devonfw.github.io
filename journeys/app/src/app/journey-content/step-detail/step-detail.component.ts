import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, JourneyData, SingleStepData } from '../../state/app.state';
import { Observable } from 'rxjs';
import { loadStep } from '../../state/steps/step.actions';

import {
  getStepDataState,
  findIndexStepExistence,
  getJourneySection,
  getUiState,
  getFirstStep, getStepData
} from '../../state/steps/step.selector';

import { take} from 'rxjs/operators';
import { getDataState } from '../../state/journeys/journey.selector';

@Component({
  selector: 'app-step-detail',
  templateUrl: './step-detail.component.html',
  styleUrls: ['./step-detail.component.css'],
})

export class StepDetailComponent implements OnInit {

  journeySection$: Observable<any>;
  journey$: Observable<JourneyData>;
  stepData$: Observable<SingleStepData>;

  constructor(private store: Store<AppState>, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {

    this.route.paramMap.subscribe((params: ParamMap) => {
      let id = params.get('stepId');
      this.stepData$ = this.store.select(getStepData({ step_id: id }))
      this.stepData$.pipe(take(1)).subscribe(stepData => {

        if (stepData == null) {

          this.store.dispatch(loadStep({ stepId: id }));

        }
      })

      this.journey$ = this.store.select(getDataState)

    })
  }


  displayNext(){
    console.log("next button clicked");
    this.store.select(getFirstStep).subscribe(stepid => {
    })
  }
  displayPrevious(){
    console.log("previous button clicked");

}
