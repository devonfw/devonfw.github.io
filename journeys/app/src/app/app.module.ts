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
import { HomeComponent } from './pages/home/home.component';
import { DataComponent } from './pages/data/data.component';
import { JourneyRoutingModule } from './journey-content/journey-routing.module';
import { JourneyContentModule } from './journey-content/journey-content.module';
import { HttpClientModule } from '@angular/common/http';
import { PageNotFoundComponent } from './journey-content/page-not-found/page-not-found.component';
import { MessagesComponent } from './messages/messages.component';
import { JourneyService } from './state/journeys/journey.service';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { JourneyDetailComponent } from './journey-content/journey-detail/journey-detail.component';
import { JourneyListComponent } from './journey-content/journey-list/journey-list.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { JourneyEffect } from './state/journeys/journey.effect';
import appReducer from './state/journeys//journey.reducer';
import { AppState, DataState } from './state/app.state';
import {getAppState} from './state/journeys/journey.selector'


@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    MessagesComponent,
    HomeComponent,
    DataComponent,
    JourneyDetailComponent,
    JourneyListComponent,
  ],
  imports: [
    BrowserModule,
    JourneyRoutingModule,
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
    JourneyRoutingModule,
    StoreModule.forRoot({ journeyData: appReducer }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
    EffectsModule.forRoot([JourneyEffect])

  ],
  providers: [JourneyService],
  bootstrap: [AppComponent]
})
export class AppModule { }
