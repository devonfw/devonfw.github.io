import { Component, OnInit,  Output, EventEmitter } from '@angular/core';
import { Journey } from '../journey';
import { JourneyService } from '../../state/journeys/journey.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Store } from '@ngrx/store';
import { loadJourney } from '../../state/journeys/journey.actions';
import { Observable } from 'rxjs';
import { resetStore } from '../../state/reset.action';

@Component({
  selector: 'app-journey-list',
  templateUrl: './journey-list.component.html',
  styleUrls: ['./journey-list.component.css']
})

export class JourneyListComponent implements OnInit {
  @Output() loadJourneyId: EventEmitter<any> = new EventEmitter<any>();
  constructor(private store: Store<{JourneyState:any}> ,private journeyService: JourneyService, private router: Router, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.store.dispatch(resetStore())
  }
  }


