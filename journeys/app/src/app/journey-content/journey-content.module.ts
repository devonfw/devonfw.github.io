import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JourneyRoutingModule } from './journey-routing.module';
import { JourneyDetailComponent } from './journey-detail/journey-detail.component';
import { JourneyListComponent } from './journey-list/journey-list.component';
import { JourneyOverviewComponent } from './journey-overview/journey-overview.component';

@NgModule({
  declarations: [
    JourneyDetailComponent,
    JourneyListComponent,
    JourneyOverviewComponent,
  ],
  imports: [
    CommonModule,
    JourneyRoutingModule,
  ]
})
export class JourneyContentModule { }
