import { Component } from '@angular/core';
import * as $ from 'jquery';
import { LooseObject } from '../loose-object';

@Component({
  selector: 'app-privacy-policy-page',
  templateUrl: './privacy-policy-page.component.html',
  styleUrls: ['./privacy-policy-page.component.css']
})
export class PrivacyPolicyPageComponent {
  colorPallete: LooseObject = { 
    '1': "#AA7BC3",
    '2': "#611F69",
    '3': "#F3DE8A",
    '4': "#048BA8",
    '5': "#30F2F2"
  };
  constructor() { 
  }

  ngOnInit() { 
    // console.log("iiiiii");
    // this.moveCardUp();

  }

  moveCardUp(): void {
    $("#card").animate({marginTop: "-=100vh"}, 400);
  }

  nav(link: string): void {
    // this.moveCardUp();

    setTimeout(() => {
      window.location.href = link;
    }, 200);
  }
}
