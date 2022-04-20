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
import { JourneyService } from './journey-content/journey.service';


@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    MessagesComponent,
    HomeComponent,
    DataComponent,
  ],
  imports: [
    BrowserModule,
    JourneyContentModule,
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
  ],
  providers: [JourneyService],
  bootstrap: [AppComponent]
})
export class AppModule { }
