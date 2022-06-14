import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { StepService } from '../steps/step.service';
import { of } from 'rxjs';
import { loadStep, loadStepFailure, loadStepSuccess, } from "./step.actions"


@Injectable()
export class StepEffect {
  constructor(private actions$: Actions, private stepService: StepService) { }
 

  loadStep$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadStep),
      mergeMap(payload => this.stepService.getStep(payload.stepId).
        pipe(
          map(journey => loadStepSuccess({ payload: journey, stepId: payload.stepId })),
          catchError(() => of(loadStepFailure({ errorMessage: "Error" })))
      ))
    )
  })
 }

