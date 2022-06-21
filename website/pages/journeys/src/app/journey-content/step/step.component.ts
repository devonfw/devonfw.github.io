import { Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';
import { ActivatedRoute, Router, } from '@angular/router';
import {getUiState, getStepData, getStepArray, getStepDataStateCurrentStep, getStepsLength,} from '../../state/steps/step.selector';
import { Store } from '@ngrx/store';
import { AppState, JourneyData, SingleStepData } from '../../state/app.state';
import { getFirstStep } from '../../state/journeys/journey.selector';
import { take } from 'rxjs';

@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class StepComponent implements OnInit {

  @Input() step: any;
  @Input() title: any;
  @Input() subtitle: any;

  constructor(private store: Store<AppState>, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {

    //hier nach der first id fragen und dann router mit stepID
    let firstStep;
    this.store.select(getStepsLength).subscribe(data => {
      if (data <= 1) {
        this.store.select(getFirstStep).pipe(take(1)).subscribe(firsStepData => {
          firstStep = firsStepData
          this.router.navigate(['/journeys', this.route.snapshot.url[1].path, firstStep.id])
        })
      }
    })

    

      

      

     

  } 
  onClick(title: string, href?: string) {
    let stepId = title;
    console.log(href)
    let journeyId = this.route.snapshot.url[1].path;
      this.router.navigate(['/journeys', journeyId, stepId,]);
    //this.router.navigate([this.router.url + ('/' + stepId)])
  }

}
