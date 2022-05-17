import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from './journey-content/page-not-found/page-not-found.component';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DataComponent } from './pages/data/data.component';
import { JourneyListComponent } from './journey-content/journey-list/journey-list.component';
import { JourneyDetailComponent } from './journey-content/journey-detail/journey-detail.component';

const routes: Routes = [
  { path: 'journeys', component: JourneyListComponent },
  { path: 'journeys/:journeyId', component: JourneyDetailComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
