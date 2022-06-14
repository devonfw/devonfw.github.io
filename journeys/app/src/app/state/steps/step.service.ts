import { Injectable } from '@angular/core';
import { Observable, throwError} from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AppState } from '../app.state';
import { Store } from '@ngrx/store';
import { Step } from "../../journey-content/step"

@Injectable({
  providedIn: 'root'
})
export class StepService {
  constructor(private http: HttpClient, private store: Store<AppState>) { }

  getStep(stepId: string) {
    return this.http.get('../../../assets/'+ stepId +'.json') as Observable <Step>


  }

  errorHandler(error: HttpErrorResponse) {
    return throwError(() => error.message || "Server Error");
  }

}
