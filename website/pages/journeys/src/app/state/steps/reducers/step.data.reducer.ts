import { loadStepSuccess } from '../step.actions';


export default function stepdataReducer(state, action) {
  switch (action.type) {
    case loadStepSuccess.type: {
      return {
        ...state,
        steps: [
          ...state.steps, action.payload
        ]
      } 
    }
    default:
      return state
  }
}
