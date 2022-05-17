import { createSelector, createFeatureSelector } from '@ngrx/store';
import { DataState, ViewStatus, UiState, AppState } from '../app.state';
import * as fromStore from './journey.reducer';

export const getAppState = createFeatureSelector<AppState>("journeyData");

export const getDataState = createSelector(
  getAppState,
  (state: AppState) => {return state.dataState}
)

