import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router , ParamMap } from '@angular/router';
import { JourneyService } from '../../state/journeys/journey.service';
import { Journey, Step } from '../journey';
import { Store } from '@ngrx/store';
import { AppState, DataState } from '../../state/app.state';
import { Observable, tap } from 'rxjs';
import { take } from 'rxjs/operators';
import * as fromSelector from '../../state/journeys/journey.selector';
import { loadJourney, loadJourneySuccess, loadJourneyFailure } from '../../state/journeys/journey.actions';
import {getDataState} from '../../state/journeys/journey.selector'

@Component({
  selector: 'app-journey-detail',
  templateUrl: './journey-detail.component.html',
  styleUrls: ['./journey-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class JourneyDetailComponent implements OnInit {
  journey$: Observable<DataState>;
  constructor(private store: Store<AppState>, private router: Router, private route: ActivatedRoute) {
   }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      let id = params.get('journeyId');
      this.store.dispatch(loadJourney({ journeyId: id }));
    });
      this.journey$ = this.store.select(getDataState);
  }

  displaySteps(journey: Journey, depth: number): void {
    let id: string = journey.title;
    document.getElementById("sectionHeader").innerHTML += `<div id="${id}" style='margin-left:${depth * 30}px '> - ${journey.title}</div>` + " " + "\n" ;

    setTimeout(() => {
      let elem = document.getElementById(id);
      elem.addEventListener("click", () => {
        console.log(elem)
      })
    });
    for(let i = 0; i < journey.sections.length; i++){
      this.displaySteps(journey.sections[i], depth+1);
    }
  }
}
