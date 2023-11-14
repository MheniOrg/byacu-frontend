import { Component, inject, Input } from '@angular/core';
import { LooseObject } from '../loose-object';
import * as $ from 'jquery';

@Component({
  selector: 'app-kente-circle',
  templateUrl: './kente-circle.component.html',
  styleUrls: ['./kente-circle.component.css']
})
export class KenteCircleComponent {
  @Input() colorPallete!: LooseObject;
  @Input() circleId!: string;
  @Input() diameter!: string;
  @Input() bottom!: string;
  @Input() right!: string;

  ngOnInit() { 

    if (this.circleId) {
      // $("#".concat(this.circleId)).css({"bottom": this.bottom, "right": this.right});
      
    }
    
  }
}
