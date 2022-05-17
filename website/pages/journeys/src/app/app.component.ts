import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { getAppState } from './state/journeys/journey.selector';

import {
  loadJourney,
  loadJourneySuccess,
  loadJourneyFailure,
} from './state/journeys/journey.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'journey';


  constructor(
    private store: Store
  ) {}
}
