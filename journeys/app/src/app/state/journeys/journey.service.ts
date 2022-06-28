import { Injectable } from '@angular/core';
import { Observable, throwError,} from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DataState, AppState } from '../app.state';
import { Store } from '@ngrx/store';
import { Journey } from "../../journey-content/journey"


@Injectable({
  providedIn: 'root'
})
export class JourneyService {
  journey$: Observable<DataState>;
  constructor(private http: HttpClient, private store: Store<AppState>) { }

  getJourney() {
    return this.http.get('../../../assets/output.json') as Observable<Journey>
    //return this.http.get('/website/pages/journeys/journeyData/index/output.json') as Observable<Journey>

  }

  errorHandler(error: HttpErrorResponse) {
    return throwError(() => error.message || "Server Error");
  }

}
