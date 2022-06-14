import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { JourneyService } from './state/journeys/journey.service';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { JourneyDetailComponent } from './journey-content/journey-detail/journey-detail.component';
import { JourneyListComponent } from './journey-content/journey-list/journey-list.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { JourneyEffect } from './state/journeys/journey.effect';
import { appReducer } from './state/mainreducer';
import { StepDetailComponent } from './journey-content/step-detail/step-detail.component'
import { StepComponent } from './journey-content/step/step.component'
import { StepService } from './state/steps/step.service';
import { StepEffect } from './state/steps/step.effect';
import { SubStepDetailComponent } from './journey-content/sub-step-detail/sub-step-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    JourneyDetailComponent,
    JourneyListComponent,
    StepDetailComponent,
    StepComponent,
    SubStepDetailComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatListModule,
    MatToolbarModule,
    MatSidenavModule,
    AppRoutingModule,
    CommonModule,
    StoreModule.forRoot({ appState: appReducer }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
    EffectsModule.forRoot([JourneyEffect, StepEffect])

  ],
  providers: [JourneyService, StepService],
  bootstrap: [AppComponent]
})
export class AppModule { }
