import { Component, inject, provideZoneChangeDetection, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from '../auth-api.service';
import { TranscriptionApiService } from '../transcription-api.service';

@Component({
  selector: 'app-video-display',
  templateUrl: './video-display.component.html',
  styleUrls: ['./video-display.component.css']
})
export class VideoDisplayComponent {


  youtubeService: AuthApiService = inject(AuthApiService);
  transcriptionService: TranscriptionApiService = inject(TranscriptionApiService);
  menuOpen: boolean = false;

  constructor(private _router: Router) { }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    //console.log(changes);
  }

  menuClick(): void {
    let menu: any = document.getElementById("menuID");
    menu.focus();
    
    if (!this.menuOpen) {
      // menu.focus();
      // //console.log("iiiiinni");
      this.menuOpen = true;
    } else {
      this.menuOpen = false;
    }

    
    
  }
  
  testEnpoint(): void {
    // this.youtubeService.testEndpoint();
    // this.youtubeService.testEndpoint3();
  }

  menuBlur(event: any): void {
    if (!event.originalTarget.contains(event.relatedTarget)) {
      this.menuOpen = false;
      // //console.log("lo", event);
    } 

  }

  testEnpoint2(): void {
    // this.transcriptionService.getResults(escape("https://www.youtube.com/watch?v=r6vz7fuq3Y0"));
  }

  navigateToHome() {
    this._router.navigateByUrl('/');
  }

  navigateToDashboard() {
    this._router.navigateByUrl('/dashboard');
  }

  SignOut(): void {
    // //console.log("kklo", e);
    // e.stopPropagation();
    localStorage.removeItem('oauth2-test-params');
    this.navigateToHome();
  }
}
