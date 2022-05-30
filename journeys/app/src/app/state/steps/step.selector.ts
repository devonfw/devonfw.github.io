import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AppState } from '../app.state';

export const getAppState = createFeatureSelector<AppState>("appState");

export const getStepDataState = createSelector(
  getAppState,
  (state: AppState) => {return state.dataState.stepData}
)
export const getStepDataStateCurrentStep = createSelector(
  getAppState,
  (state: AppState) => { return state.dataState.stepData.steps }
  )

export const getUiState = createSelector(
  getAppState,
  (state: AppState) => { return state.uiState }
  )

  export const checkStepExistence = ({step_id: step_id}) => createSelector(
    getAppState,
    (state: AppState) => { return state.dataState.stepData.steps.filter(x => x.title.replace(/\s/g, "") == step_id).length > 0 }
);
export const findIndexStepExistence = ({ step_id: step_id }) => createSelector(
  getAppState,
  (state: AppState) => { return state.dataState.stepData.steps.findIndex(x => x.title.replace(/\s/g, "") == step_id)}
);

