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
    (state: AppState) => { return state.dataState.stepData.steps.filter(x => x.stepId == step_id).length > 0 }
);

export const findIndexStepExistence = ({ step_id: step_id }) => createSelector(
  getAppState,
  (state: AppState) => { return state.dataState.stepData.steps.findIndex(x => x.stepId == step_id) }
);

export const getJourneySection = createSelector(
  getAppState,
  (state: AppState) => { return state.dataState.journeyData.sections.filter(x => !!x)[0] });

// if (journeySections.length >s 0) {
//   journeySections[0].sections.filter(x => x.id == step_id && x.sections.length > 0 )

// }

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


