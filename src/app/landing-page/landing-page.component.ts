import { Component, inject } from '@angular/core';
import * as $ from 'jquery';
// import { environment } from '../../environments/environment';
import { AuthApiService } from '../auth-api.service';





@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  youtubeService: AuthApiService = inject(AuthApiService);

  words: string[] = ['Start Transcription ?', 'Tangira Kwandukura ?']; //, 'Anza Unukuzi ?', 'Tandika Okuwandiika ?'];
  i: number = 0;
  offset: number = 0;
  len: number = 2;
  forwards: boolean = true;
  skip_count: number = 0;
  skip_delay: number = 90;
  speed: number = 35;
  part: string = '';
  textOpen = false;
  gifOpen = false;
  
  // YOUR_CLIENT_ID: string  = environment.YOUR_CLIENT_ID;
  // YOUR_REDIRECT_URI: string = environment.YOUR_REDIRECT_URI;
  
  constructor() { 
    /* console.log(environment); */ 
    // console.log(this.YOUR_CLIENT_ID, this.YOUR_REDIRECT_URI);
  }

  

  // implement OnInit's `ngOnInit` method
  ngOnInit() { 

    $(document).ready(() => {
      this.wordflick();
    });

  }

  showText(): void {

    var element = $("#how-it-works-text");


    if (!this.textOpen) {
      // element.css({ "height": "fit-content", "overflow-y": "visible" });

      element.css("height", "250px");
      element.css("overflow-y", "scroll");


      // setTimeout(() => {
      //   element.focus();
      // }, 1000);
      this.textOpen = true;

      console.log("open");
    } else {
      
      this.textOpen = false;

      element.css("height", "0px");
      element.css("overflow-y", "hidden");
      console.log("closed");
    }
    
  }

  showGif(): void {

    var element = $("#why-it-matters-text");


    if (!this.gifOpen) {
      // element.css({ "height": "fit-content", "overflow-y": "visible" });

      element.css("height", "1000px");
      element.css("overflow-y", "scroll");


      // setTimeout(() => {
      //   element.focus();
      // }, 1000);
      this.gifOpen = true;

      console.log("open");
    } else {
      
      this.gifOpen = false;

      element.css("height", "0px");
      element.css("overflow-y", "hidden");
      console.log("closed");
    }
    
  }

  hideText(): void {
    var element = $("#how-it-works-text");
    // console.log("uhy");
    // element.css({ "height": "0px", "overflow-y": "hidden" });
    this.textOpen = false;

    element.css("height", "0px");
    element.css("overflow-y", "hidden");
    console.log("closed");
  }

  connect(): void {
    // this.youtubeService.oauth2SignIn(this.YOUR_CLIENT_ID, this.YOUR_REDIRECT_URI);
    this.youtubeService.initiateOath2Flow("http://justyams.com/dashboard");
  }

  wordflick(): void {
    setInterval(() => {
      if (this.forwards) {
        if (this.offset >= this.words[this.i].length) {
          ++this.skip_count;
          if (this.skip_count == this.skip_delay) {
            this.forwards = false;
            this.skip_count = 0;
          }
        }
      }
      else {
        if (this.offset == 0) {
          this.forwards = true;
          this.i++;
          this.offset = 0;
          if (this.i >= this.len) {
            this.i = 0;
          }
        }
      }
      this.part = this.words[this.i].substr(0, this.offset);
      if (this.skip_count == 0) {
        if (this.forwards) {
          this.offset++;
        }
        else {
          this.offset--;
        }
      }
      $('.message').text(this.part);
    }, this.speed);
  };
  
  
}
