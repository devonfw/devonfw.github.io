import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from './journey-content/page-not-found/page-not-found.component';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DataComponent } from './pages/data/data.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent},
  { path: '', redirectTo: 'journeys', pathMatch: 'full' },
  { path: 'data', component: DataComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }