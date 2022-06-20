import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, JourneyData, SingleStepData } from '../../state/app.state';
import { Observable } from 'rxjs';
import { loadStep } from '../../state/steps/step.actions';

import {getUiState, getStepData, getStepArray,} from '../../state/steps/step.selector';

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

      this.store.select(getStepArray).subscribe(data => {
        let journeySections: any = data.filter(x => typeof x!==undefined).shift()

        let currentStepId = this.route.snapshot.url[2].path;
        let nextStepId = +currentStepId + +1
        let nextStepExistence = journeySections.sections.find(x => x.id == nextStepId)
        if (!nextStepExistence) {
          (document.getElementById('nextButton') as HTMLInputElement).disabled = true
        }
        else {
          (document.getElementById('nextButton') as HTMLInputElement).disabled = false
        }

        let previousStepId = +currentStepId - +1
        let previousStepExistence = journeySections.sections.find(x => x.id == previousStepId)
        if (!previousStepExistence) {
          (document.getElementById('previousButton') as HTMLInputElement).disabled = true
        }
        else {
          (document.getElementById('previousButton') as HTMLInputElement).disabled = false
        }
      })
    })
  }

  displayNext() {
    let currentStepId = this.route.snapshot.url[2].path;
    let nextStepId = +currentStepId + +1
    let journeyId = this.route.snapshot.url[1].path;
    this.router.navigate(['/journeys', journeyId, nextStepId]);
  }

  displayPrevious() {
    let currentStepId = this.route.snapshot.url[2].path;
    let nextStepId = +currentStepId - +1
    let journeyId = this.route.snapshot.url[1].path;
    this.router.navigate(['/journeys', journeyId, nextStepId]);
  }
  
}

