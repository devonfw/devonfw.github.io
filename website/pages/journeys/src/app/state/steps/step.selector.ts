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


export const getStepData = ({ step_id: step_id }) => createSelector(
  getAppState,
  (state: AppState) => { return state.dataState.stepData.steps.find(x => x.stepId == step_id) }


export const getFirstStep =  createSelector(
  getAppState,
  (state: AppState) => { return state.dataState.journeyData.sections
  }
)
export const getLastStep =  createSelector(
  getAppState,
  (state: AppState) => {return state.dataState.journeyData.sections
  }
)



