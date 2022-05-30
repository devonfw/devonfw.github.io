import { ViewStatus } from '../../app.state';
import { loadStep, loadStepSuccess, loadStepFailure } from '../step.actions';

export default function uiReducer(state, action) {
  switch (action.type) {
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
