import { Component, OnInit } from '@angular/core';
import { Journey } from '../journeys';
import { JourneyService } from '../journey.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-journey-list',
  templateUrl: './journey-list.component.html',
  styleUrls: ['./journey-list.component.css']
})
export class JourneyListComponent implements OnInit {

  selectedJourneyId: number = 0;
  journeys: Journey[] = [];
  journeysFetched:boolean = false;

  constructor(private journeyService: JourneyService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    //TODO 1.1:  nur einmaliges Laden der Daten + Loading Page darstellen solange Daten noch nicht angekommen sind.
    this.fetchJourneys();
    this.journeys = this.journeyService.getJourneys();
    this.route.paramMap.subscribe((params: ParamMap) => {
      let id = Number(params.get('journeyId'));
      this.selectedJourneyId = id;
      });
   }

  fetchJourneys(): void {
    this.journeyService.fetchJourneys().subscribe((journey) => {
      this.journeys = journey;
    });
  }

  onSelect(journey: Journey): void {
    this.router.navigate([journey.id], {relativeTo: this.route})
  }

  isSelected(journey: Journey) { return journey.id === this.selectedJourneyId; }

}
