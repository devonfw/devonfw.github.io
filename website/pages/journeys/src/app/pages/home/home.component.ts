import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  onLoading(journeyId: string) {
    console.log(journeyId);
    //this.store.dispatch(loadJourney({ journeyId }));
  }

}
