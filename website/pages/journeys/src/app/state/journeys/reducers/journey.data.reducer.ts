import { loadJourneySuccess } from '../journey.actions';



export default function dataReducer(state, action) {
  switch (action.type) {
    case loadJourneySuccess.type: {
      return {
        ...state, title: action.payload.title, section: action.payload.sections,
      }
    }
    default:
      return state
  }
}
