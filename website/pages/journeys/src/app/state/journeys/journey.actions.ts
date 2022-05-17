import { createAction, props } from '@ngrx/store';
import { Journey, Step } from "../../journey-content/journey"

export const loadJourney = createAction(
    '[Journey] Load Journey',
    props<{ journeyId: string }>(),
  );

export const loadJourneySuccess = createAction(
    '[Journey API] Load Journey Success',
    props<{ payload: Journey }>(),
  );

export const loadJourneyFailure = createAction(
    '[Journey API] Load Journey Failure',
    props<{ errorMessage: string }>(),
  );
