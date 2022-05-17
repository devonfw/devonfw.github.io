import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { JourneyService } from '../journeys/journey.service';
import { of } from 'rxjs';
import { loadJourneySuccess, loadJourneyFailure, loadJourney } from "./journey.actions"


@Injectable()
export class JourneyEffect {
  constructor(private actions$: Actions, private journeyService: JourneyService) { }


  loadJourney$ = createEffect(() => {
    return this.actions$.
    pipe(ofType(loadJourney.type),
      mergeMap(payload => this.journeyService.getJourney().
      pipe(
        map(journey => loadJourneySuccess({payload: journey})),
      catchError(() => of(loadJourneyFailure({errorMessage: "Error"})))
      ))
    )
  })
 }

