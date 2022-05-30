import { ViewStatus} from '../../app.state';
import { loadJourney, loadJourneySuccess, loadJourneyFailure } from '../journey.actions';

export default function uiReducer(state, action) {
  switch (action.type) {
    case loadJourney.type: {
      console.log("journeyuireducer")
      return {
        ...state, viewStatus: ViewStatus.Loading,
      }
    }
    case loadJourneySuccess.type: {
      return {
        ...state, viewStatus: ViewStatus.Success,
      }
    }
    case loadJourneyFailure.type: {
      return {
        ...state, viewStatus: ViewStatus.Failure, errorMessage: action.errorMessage
      }
    }
    default:
      return state
  }
}
