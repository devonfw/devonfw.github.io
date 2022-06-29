import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, JourneyData, SingleStepData } from '../../state/app.state';
import { Observable } from 'rxjs';
import { loadStep } from '../../state/steps/step.actions';
import { changeColour } from '../step/step.component'
import { getUiState, getStepData, getStepArray, } from '../../state/steps/step.selector';

import { take} from 'rxjs/operators';
import { getDataState, getFirstStep, getLastStep } from '../../state/journeys/journey.selector';

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

      let firstStep;
      this.store.select(getFirstStep).pipe(take(1)).subscribe(data => {
        firstStep = data;
       if (firstStep.id == id) {
         (document.getElementById('previousButton') as HTMLInputElement).disabled = true
       }
       else {
         (document.getElementById('previousButton') as HTMLInputElement).disabled = false
       }
      })

      let lastStep;
      this.store.select(getLastStep).pipe(take(1)).subscribe(data => {
        lastStep = data;
       if (lastStep.id == id) {
         (document.getElementById('nextButton') as HTMLInputElement).disabled = true
       }
       else {
         (document.getElementById('nextButton') as HTMLInputElement).disabled = false
       }
      })
    })
  }

  displayNext() {
    let currentStepId = this.route.snapshot.url[2].path;
    let nextStepId = +currentStepId + +1
    let journeyId = this.route.snapshot.url[1].path;
    let currentStep
    this.store.select(getStepData({ step_id: nextStepId })).subscribe(data => {
      currentStep = data
     changeColour(currentStep.title)
    })
    this.router.navigate(['/journeys', journeyId, nextStepId]);
    
  }

  displayPrevious() {
    let currentStepId = this.route.snapshot.url[2].path;
    let previousStepId = +currentStepId - +1
    let journeyId = this.route.snapshot.url[1].path;
    let currentStep
    this.store.select(getStepData({ step_id: previousStepId })).subscribe(data => {
      currentStep = data
      changeColour(currentStep.title)
    })
    this.router.navigate(['/journeys', journeyId, previousStepId]);
  }
  
}

