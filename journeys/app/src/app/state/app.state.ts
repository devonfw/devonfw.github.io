export enum ViewStatus {
    Initial = 'INITIAL',
    Loading = 'LOADING',
    Success = 'SUCCESS',
    Failure = 'FAILURE',
}

export interface DataState {
  title: string;
  journeyId: string;
  section: [];
}
export interface UiState {
  viewStatus: ViewStatus;
  errorMessage?: string;
}

export interface AppState {
  uiState: UiState;
  dataState: DataState;
}

