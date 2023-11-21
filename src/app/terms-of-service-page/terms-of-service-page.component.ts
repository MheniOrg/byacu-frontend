import { Component } from '@angular/core';
import * as $ from 'jquery';
import { LooseObject } from '../loose-object';

@Component({
  selector: 'app-terms-of-service-page',
  templateUrl: './terms-of-service-page.component.html',
  styleUrls: ['./terms-of-service-page.component.css']
})
export class TermsOfServicePageComponent {
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
    // //console.log("iiiiii");
    // this.moveCardUp();

  }

  moveCardUp(): void {
    $("#card").animate({marginTop: "-=100vh"}, 500, "swing");
  }

  nav(link: string): void {
    this.moveCardUp();

    setTimeout(() => {
      window.location.href = link;
    }, 500);
  }
}
