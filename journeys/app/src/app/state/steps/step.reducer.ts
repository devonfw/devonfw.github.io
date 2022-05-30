import { ViewStatus, UiState, AppState, DataState, JourneyData, StepData } from '../app.state';
import uiReducer from './reducers/step.ui.reducer'
import dataReducer from './reducers/step.data.reducer'

export const initialUiState: UiState = {
  viewStatus: ViewStatus.Initial,
}

const initialJourneyData: JourneyData = {
  title: " ",
  journeyId: "",
  sections: [],
}
const initialStepData: StepData= {
  steps: [
    {title: "",
    sections: "",
    }
  ]
}
export const initialDataState: DataState = {
  journeyData: initialJourneyData,
  stepData: initialStepData,
}

export const initialState: AppState = {
  uiState: initialUiState,
  dataState: initialDataState,
};

export default function steppAppReducer(state = initialState, action) {

  return {
    uiState: uiReducer(state.uiState, action),
    dataState: dataReducer(state.dataState, action)
  }
}
