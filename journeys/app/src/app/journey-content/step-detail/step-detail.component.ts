import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState, StepData } from '../../state/app.state';
import { Observable } from 'rxjs';
import { loadStep } from '../../state/steps/step.actions';
import { getStepDataState, findIndexStepExistence } from '../../state/steps/step.selector';


@Component({
  selector: 'app-step-detail',
  templateUrl: './step-detail.component.html',
  styleUrls: ['./step-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class StepDetailComponent implements OnInit {

  step$: Observable<StepData>;
  index$: Observable<number>;

  constructor(private store: Store<AppState>, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      let id = params.get('stepId');
      this.index$ = this.store.select(findIndexStepExistence({ step_id: id }))
      this.index$.subscribe(data => {
        if (data == -1) {
          this.store.dispatch(loadStep({ stepId: id }));
        }
      });
         
    });
    this.step$ = this.store.select(getStepDataState)
  }

}
