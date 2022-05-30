import { ViewStatus, JourneyData, StepData,  UiState, AppState, DataState } from '../app.state';

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


// export function appReducer(state = initialState, action): ActionReducerMap<AppState>  {
//   return {
    
//     uiState: uiReducer(state.uiState , action),
//     dataState: dataReducer(state.dataState, action)
//   }
// }
