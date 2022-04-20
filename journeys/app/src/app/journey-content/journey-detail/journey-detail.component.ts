import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router , ParamMap } from '@angular/router';
import { JourneyService } from '../journey.service';
import { Journey, Step } from '../journeys';

@Component({
  selector: 'app-journey-detail',
  templateUrl: './journey-detail.component.html',
  styleUrls: ['./journey-detail.component.css']
})
export class JourneyDetailComponent implements OnInit {

  selectedJourneyId: number = 0;
  journeys: Journey[] = [];
  journey?: Journey;
  title: string = "";
  steps: Step[] = [];
  journeyFetched:boolean = false;

  constructor(private journeyService: JourneyService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.fetchJourneys();
    this.journeys = this.journeyService.getJourneys();
    this.route.paramMap.subscribe((params: ParamMap) => {
      let id = Number(params.get('journeyId'));
      this.selectedJourneyId = id;
    });
    this.initData();
    this.journeyFetched = this.selectJourney(this.selectedJourneyId);
  }

  fetchJourneys(): void {
    this.journeyService.fetchJourneys().subscribe((journey) => {
      this.journeys = journey;
    });
  }

  initData(): void {
    this.journey = this.journeyService.getJourney(this.selectedJourneyId, this.journeys);
    this.title = this.journey.title;
    this.steps = this.journey.steps;
  }

  selectJourney(journeyId: number): boolean {
    let isJourneyExisting: boolean = false;
    this.journeys.find((journey) => {
      if(journey.id == journeyId) {
        isJourneyExisting = true;
      }
    });
    return isJourneyExisting;
  }

  onSelect(step: Step): void {
    this.router.navigate([step.id, 'overview'], {relativeTo: this.route})
  }

  start(): void {
    this.router.navigate([1, 'overview'], {relativeTo: this.route})
  }

  isSelected(journey: Journey) { return journey.id === this.selectedJourneyId; }
}