import { Component, OnInit } from '@angular/core';
import { JourneyService } from '../journey.service';
import { Journey, Step } from '../journeys';
import { Router, ActivatedRoute, ParamMap } from '@angular/router'

@Component({
  selector: 'app-journey-overview',
  templateUrl: './journey-overview.component.html',
  styleUrls: ['./journey-overview.component.css']
})
export class JourneyOverviewComponent implements OnInit {

  selectedJourneyId: number = 0;
  stepId: number = 0;
  journeys: Journey[] = [];
  journey?: Journey;
  title: string = "";
  currentStep: number = 0;
  amountSteps: number = 0;
  steps: Step[] = [];
  content: string = "";
  journeyFetched: boolean = false;
  constructor(private journeyService: JourneyService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.journeys = this.journeyService.getJourneys();
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.selectedJourneyId = Number(params.get('journeyId'));
      this.stepId = Number(params.get('stepId'));
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
    this.steps = this.journeyService.getSteps(this.selectedJourneyId, this.journeys);
    this.content = this.journeyService.getContent(this.stepId, this.steps);
    this.currentStep = this.journey.currentStep;
    this.amountSteps = this.journey.amountSteps;
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

  isNotFirstStep(): boolean {
    let result = (this.currentStep > 1);
    return result
  }

  isNotLastStep(): boolean {
    let result = (this.currentStep < this.amountSteps)
    return result;
  }

  goPrevious(): void {
    let previousStep = this.currentStep-1;
    if(previousStep >= 1) {
      this.currentStep -= 1;
      this.updateContent(this.currentStep);
      this.router.navigate(['../../', previousStep, 'overview'], {relativeTo: this.route});
    }
    else
    {
      //this.router.navigate(['../'], {relativeTo: this.route});
      console.log("This is the first Step");
    }
  }

  goNext(): void {
    let nextStep = this.currentStep + 1;
    if(nextStep <= this.amountSteps) {
      this.currentStep += 1;
      this.updateContent(this.currentStep);
      this.router.navigate(['../../', nextStep, 'overview'], {relativeTo: this.route});
    }
  }

  updateContent(id: number): void {
    this.steps.find((step) => {
          if(step.id == id) {
            this.content = step.content;
          }
    });
  }

}
