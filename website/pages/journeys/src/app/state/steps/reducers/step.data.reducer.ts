import { loadStepSuccess } from '../step.actions';


export default function stepdataReducer(state, action) {
  switch (action.type) {
    case loadStepSuccess.type: {
      return {
        ...state,
     
        steps: [
          ...state.steps,
          {
            stepId: action.stepId,
            title: action.payload.title,
            sections: action.payload.sections,
          }
        ]
      } 
    }
    default:
      return state
  }
}
