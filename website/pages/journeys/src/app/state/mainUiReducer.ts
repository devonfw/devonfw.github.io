import { ViewStatus} from './app.state';
import { loadJourney, loadJourneySuccess, loadJourneyFailure } from './journeys/journey.actions';
import { loadStep, loadStepSuccess, loadStepFailure } from './steps/step.actions';

export default function uiReducer(state, action) {
  switch (action.type) {
    case loadJourney.type: {
      return {
         ...state, viewStatus: ViewStatus.Loading,
      }
    }
    case loadJourneySuccess.type: {
      return {
        ...state,
        viewStatus: ViewStatus.Success,
      }
    }
    case loadJourneyFailure.type: {
      return {
        ...state, viewStatus: ViewStatus.Failure, errorMessage: action.errorMessage
      }
    }
    case loadStep.type: {
        return {
          ...state,
          viewStatus: ViewStatus.Loading,
        }
      }
    case loadStepSuccess.type: {
        return {
          ...state,
          viewStatus: ViewStatus.Success,
        }
      }
    case loadStepFailure.type: {
        return {
          ...state,
          viewStatus: ViewStatus.Failure,
          errorMessage: action.errorMessage
        }
    }
    default:
      return state
  }
}
