export enum ViewStatus {
    Initial = 'INITIAL',
    Loading = 'LOADING',
    Success = 'SUCCESS',
    Failure = 'FAILURE',
}

export interface DataState {
  journeyData: JourneyData;
  stepData: StepData;
}

export interface JourneyData {
  title: string,
  journeyId: string;
  sections: [];
}
export interface SingleStepData {
  stepId: string,
  title: string,
  sections: string,
}
export interface StepData {
  steps: [SingleStepData]
}

export interface UiState {
  viewStatus: ViewStatus;
  hasPrevStep?: boolean;
  hasNextStep?: boolean;
  errorMessage?: string;
}

export interface AppState {
  uiState: UiState;
  dataState: DataState;
}

