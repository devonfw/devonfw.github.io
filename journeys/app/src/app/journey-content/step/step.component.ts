import { Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';
import { ActivatedRoute, Router, } from '@angular/router';
import {getUiState, getStepData, getStepArray, getStepDataStateCurrentStep, getStepsLength,} from '../../state/steps/step.selector';
import { Store } from '@ngrx/store';
import { AppState, JourneyData, SingleStepData } from '../../state/app.state';
import { getFirstStep } from '../../state/journeys/journey.selector';
import { take } from 'rxjs';
import { Observable } from 'rxjs';
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
  @Input() lastSelected: any;
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


  onClick(routerTitle: string, stepTitle: string) {
    console.log("stepTitle: " + stepTitle)
    console.log("routerTitle: " + routerTitle)
    let step_titles = document.getElementsByClassName("step_titles") as HTMLCollectionOf<HTMLElement>;
    for(let i = 0; i<step_titles.length; i++){
      if(step_titles[i].style.color == "blue"){
        step_titles[i].style.color = "blue"
      }

    }
    let stepId = routerTitle;
    let journeyId = this.route.snapshot.url[1].path;
    this.router.navigate(['/journeys', journeyId, stepId]);
    //this.router.navigate([this.router.url + ('/' + stepId)])
  }

  changeColor(stepTitle: string){
    setTimeout(() => {
      let step_titles = document.getElementsByClassName("step_titles") as HTMLCollectionOf<HTMLElement>;
      for(let i = 0; i<step_titles.length; i++){
        if(step_titles[i].innerText == stepTitle){
          step_titles[i].style.color = "blue"
        }
        else{
          step_titles[i].style.color = "black"
        }
      }
    }, 50)

  }


  scroll(title: string) {
    if ( document.getElementById(title)) {
      document.getElementById(title).scrollIntoView({ behavior: 'smooth'});
      if (document.getElementsByClassName("steps")) {
        let first = document.getElementsByClassName("steps")[1];
        first.classList.remove("steps");
        first.classList.add("steps")
      }
    }
  }

}
