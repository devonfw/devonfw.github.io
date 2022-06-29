import { createSelector, createFeatureSelector } from '@ngrx/store';
import { first } from 'rxjs';
import { AppState } from '../app.state';

export const getAppState = createFeatureSelector<AppState>("appState");

export const getDataState = createSelector(
  getAppState,
  (state: AppState) => {return state.dataState.journeyData}
)

export const getFirstStep  =  createSelector(
  getAppState,
  (state: AppState) => { return state.dataState.journeyData.sections.find((value, index) => index === 0)}
 )

 export const getLastStep  =  createSelector(
  getAppState,
  (state: AppState) => { return state.dataState.journeyData.sections.find((value, index) => index === state.dataState.journeyData.sections.length -1 )}
 )


