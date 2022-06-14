import { ViewStatus, JourneyData, StepData,  UiState, AppState, DataState } from './app.state';
import journeydataReducer from './journeys/reducers/journey.data.reducer'
import stepdataReducer from './steps/reducers/step.data.reducer'
import mainUiReducer from './mainUiReducer'

export const initialUiState: UiState = {
  viewStatus: ViewStatus.Initial,
}

const initialJourneyData: JourneyData = {
  title: " ",
  journeyId: "",
  sections: [],
}
const initialStepData: StepData = {
  steps: [
    {
      stepId: "",
      title: "",
      sections: "",
      }
  ],
}
export const initialDataState: DataState = {
  journeyData: initialJourneyData,
  stepData: initialStepData,
}

export const initialState: AppState = {
  uiState: initialUiState,
  dataState: initialDataState,
};


export function appReducer(state = initialState, action) {
    return {
      uiState: mainUiReducer(state.uiState, action),
      dataState: dataReducer(state.dataState, action)
    }
  }
  
export function dataReducer(state, action) {
    return {
      journeyData: journeydataReducer(state.journeyData, action),
      stepData: stepdataReducer(state.stepData, action)
    
  }
}
  
