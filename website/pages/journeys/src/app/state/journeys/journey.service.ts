import { Injectable } from '@angular/core';
import { Observable, throwError, catchError, tap} from 'rxjs';
import { Journey, Step} from '../../journey-content/journey';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DataState, AppState } from '../app.state';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root'
})
export class JourneyService {
  journey$: Observable<DataState>;
  constructor(private http: HttpClient, private store: Store<AppState>) { }

  getJourney() {
    return this.http.get('../../../assets/dummy.json').pipe(
      tap(console.log));

  }

  errorHandler(error: HttpErrorResponse) {
    return throwError(() => error.message || "Server Error");
  }

}
