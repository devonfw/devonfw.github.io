import { ViewStatus, UiState, AppState, DataState } from '../app.state';
import uiReducer from './reducers/journey.ui.reducer'
import dataReducer from './reducers/journey.data.reducer'

export const initialUiState: UiState = {
  viewStatus: ViewStatus.Initial,
}

export const initialDataState: DataState = {
  title: "",
  journeyId: "",
  section: [],
}

export const initialState: AppState = {
  uiState: initialUiState,
  dataState: initialDataState,
};

export default function appReducer(state = initialState, action) {
  return {
    uiState: uiReducer(state.uiState , action),
    dataState: dataReducer(state.dataState, action)
  }
}
