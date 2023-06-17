import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { User } from '../user';
import { Router } from '@angular/router';
import { YoutubeApiService } from '../youtube-api.service';

@Component({
  selector: 'app-user-display',
  templateUrl: './user-display.component.html',
  styleUrls: ['./user-display.component.css']
})
export class UserDisplayComponent {
  @Input() user!: User;
  youtubeService: YoutubeApiService = inject(YoutubeApiService);
  menuOpen: boolean = false;

  constructor(private _router: Router) { }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    console.log(changes);
  }

  menuClick(): void {
    this.menuOpen = !this.menuOpen;
  }
  
  testEnpoint(): void {
    this.youtubeService.testEndpoint();
  }

  testEnpoint2(): void {
    this.youtubeService.testEndpoint2();
  }

  navigateToHome() {
    this._router.navigateByUrl('/')
  }

  SignOut(): void {
    localStorage.removeItem('oauth2-test-params');
    this.navigateToHome();
  }
}
