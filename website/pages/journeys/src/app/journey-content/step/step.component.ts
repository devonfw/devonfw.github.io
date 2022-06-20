import { Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';
import { ActivatedRoute, Router, } from '@angular/router';
import {getUiState, getStepData, getStepArray,} from '../../state/steps/step.selector';
import { Store } from '@ngrx/store';
import { AppState, JourneyData, SingleStepData } from '../../state/app.state';

@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class StepComponent implements OnInit {

  @Input() step: any;
  @Input() title: any;

  constructor(private store: Store<AppState>, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    //hier nach der first id fragen und dann router mit stepID
    this.store.select(getStepArray).subscribe(data => {
      let journeySections: any = data.filter(x => typeof x!==undefined).shift()
      let firstStepId = journeySections.sections[0].id
      let journeyId = this.route.snapshot.url[1].path;
      this.router.navigate(['/journeys', journeyId, firstStepId]);
      

      

     
    })
  } 
  onClick(title: string) {
    let stepId = title;
    let journeyId = this.route.snapshot.url[1].path;
    this.router.navigate(['/journeys', journeyId, stepId]);
    //this.router.navigate([this.router.url + ('/' + stepId)])
  }

}
