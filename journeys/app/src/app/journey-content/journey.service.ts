import { Injectable } from '@angular/core';
import { Observable, throwError, catchError} from 'rxjs';
import { Journey, Step} from './journeys';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

//TODO 1: Wo implementiere ich Journey zu ende ?
/*
  getSteps(): Step[];
  isStepAccomplished(id:number):boolean;
  nextStep():void;
  previousStep():void;
*/

@Injectable({
  providedIn: 'root'
})
export class JourneyService {

  private _url: string = "../../../assets/journeyMOCKUP";
  private journeys: Journey[] = [];
  constructor(private http: HttpClient) { }

  fetchJourneys(): Observable<Journey[]> {
    return this.http.get<Journey[]>(this._url).pipe(
                    catchError(this.errorHandler));
  }

  errorHandler(error: HttpErrorResponse) {
    return throwError(() => error.message || "Server Error");
  }

  getJourneys(): Journey[] {
    this.fetchJourneys().subscribe((journey) => {this.journeys = journey});
    return this.journeys;
  }

  getJourney(id: number, journeyList: Journey[]): Journey {
    let resJourney: Journey = {
        id: 0,
        title: '',
        currentStep: 0,
        amountSteps: 0,
        isJourneyFinished: false,
        steps: [],
    };
    journeyList.find((journey) => {
      if(journey.id === id) {
        resJourney = journey;
      }
    });
    return resJourney;
  }

  getSteps(id: number, journeyList: Journey[]): Step[] {
    let journey: Journey = this.getJourney(id, journeyList);
    return journey.steps;
  }

  getContent(stepId: number, steps: Step[]): string {
    let content = "";
    steps.find((step) => {
          if(step.id == stepId) {
            content = step.content;
          }
        });
    return content;
  }
  isFirstStep(id: number, journeyList: Journey[]): boolean {
    let journey = this.getJourney(id, journeyList);
    return (journey.currentStep === 1);
  }

  isLastStep(id: number, journeyList: Journey[]): boolean {
    let journey = this.getJourney(id, journeyList);
    return (journey.currentStep === journey.amountSteps);
  }

  nextStep(id: number, journeyList: Journey[]): number {
    let journey = this.getJourney(id, journeyList);
    let nextStep = journey.currentStep += 1;
    if(nextStep < journey.amountSteps) {
      return nextStep;
    }
    else{
      return journey.currentStep;
    }
  }

  previousStep(id: number, journeyList: Journey[]): number {
    let journey = this.getJourney(id, journeyList);
    let previousStep = journey.currentStep -= 1;
    if(previousStep >= 1) {
      return previousStep;
    }
    else {
       return journey.currentStep;
    }
  }

  /**
  Returns whether the journey is in the first step

  isJourneysFirstStep(id: number): boolean {
    const journey = this.getJourneyObj(id);
    return Object.values(journey)[3] === 1;
  }

  /**
  Returns whether the journey is in the last step

  isJourneysLastStep(id: number): boolean {
    const journey = this.getJourneyObj(id);
    let journeySteps = Object.values(journey)[4];
    return Object.values(journey)[3] === journeySteps;
  }
 */
}
