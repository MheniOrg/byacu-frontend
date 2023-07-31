import { Component, inject, Input, provideZoneChangeDetection, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { User } from '../user';
import { Router } from '@angular/router';
import { YoutubeApiService } from '../youtube-api.service';
import { TranscriptionApiService } from '../transcription-api.service';

@Component({
  selector: 'app-user-display',
  templateUrl: './user-display.component.html',
  styleUrls: ['./user-display.component.css']
})
export class UserDisplayComponent {
  @Input() user!: User;
  youtubeService: YoutubeApiService = inject(YoutubeApiService);
  transcriptionService: TranscriptionApiService = inject(TranscriptionApiService);
  menuOpen: boolean = false;

  @Output() changeLangEvent = new EventEmitter<string>();

  constructor(private _router: Router) { }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    console.log(changes);
  }

  menuClick(): void {
    let menu: any = document.getElementById("menuID");
    
    if (!this.menuOpen) {
      menu.focus();
      // console.log("iiiiinni");
      this.menuOpen = true;
    } else {
      // this.menuOpen = false;
    }

    
    
  }

  changeLang() : void {
    this.changeLangEvent.emit();
  }
  
  testEnpoint(): void {
    // this.youtubeService.testEndpoint();
    // this.youtubeService.testEndpoint3();
  }

  menuBlur(event: any): void {
    if (!event.originalTarget.contains(event.relatedTarget)) {
      this.menuOpen = false;
      // console.log("lo", event);
    } 

  }

  testEnpoint2(): void {
    this.transcriptionService.getResults(escape("https://www.youtube.com/watch?v=r6vz7fuq3Y0"));
  }

  navigateToHome() {
    this._router.navigateByUrl('/')
  }

  SignOut(): void {
    // console.log("kklo", e);
    // e.stopPropagation();
    localStorage.removeItem('oauth2-test-params');
    this.navigateToHome();
  }
}
