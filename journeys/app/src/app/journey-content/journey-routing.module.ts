import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JourneyDetailComponent } from './journey-detail/journey-detail.component';
import { JourneyListComponent } from './journey-list/journey-list.component';

const routes: Routes = [
    { path: 'journeys', component: JourneyListComponent},
    { path: 'journeys/:journeyId', component: JourneyDetailComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JourneyRoutingModule { }
