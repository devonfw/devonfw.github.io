import { Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';
import { ActivatedRoute, Router, } from '@angular/router';

@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class StepComponent implements OnInit {

  @Input() step: any;
  @Input() title: any;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    //hier nach der first id fragen und dann router mit stepID
  } 
  onClick(title: string) {

    let stepId = title;

    //this.router.navigate([this.router.url + ('/' + stepId)])

    let journeyId = this.route.snapshot.url[1].path;

    this.router.navigate(['/journeys', journeyId, stepId]);

    //...
  }

}
