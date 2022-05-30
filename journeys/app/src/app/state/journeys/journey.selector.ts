import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AppState } from '../app.state';

export const getAppState = createFeatureSelector<AppState>("appState");

export const getDataState = createSelector(
  getAppState,
  (state: AppState) => {return state.dataState.journeyData}
)

