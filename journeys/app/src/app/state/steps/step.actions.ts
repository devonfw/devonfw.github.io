import { createAction, props } from '@ngrx/store';
import { Step } from "../../journey-content/step"

export const loadStep = createAction(
   '[Step] Load Step',
    props<{ stepId: string }>()
  );

export const loadStepSuccess = createAction(
  '[Step API] Load Step Success',
    props<{ payload: Step }>(),
  );

export const loadStepFailure = createAction(
    '[Step API] Load Step Failure',
    props<{ errorMessage: string }>(),
);
