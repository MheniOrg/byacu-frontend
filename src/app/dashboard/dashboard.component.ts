import { Component, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { YoutubeApiService } from '../youtube-api.service';
import { User } from '../user';
import { Video } from '../video';
import { StrictObject } from '../strict-object';
import { LooseObject } from '../loose-object';
import { Thumbnail } from '../thumbnail';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  youtubeService: YoutubeApiService = inject(YoutubeApiService);
  fragmentString = location.hash.substring(1);
  token: string = "";
  user: User = {id: "###", likes: "###", uploads: "###", channelName: "###", channelDescription: "###", customURL: "###", timeOnPLatform: "###", thumbnails: []};;
  uploads: Video[] = [];
  YOUR_CLIENT_ID: string  = environment.YOUR_CLIENT_ID;
  YOUR_REDIRECT_URI: string = environment.YOUR_REDIRECT_URI;

  ngOnInit() { 
    // Parse query string to see if page request is coming from OAuth 2.0 server.

    this.youtubeService.consumeOathToken();
    this.token = this.youtubeService.getCredentials();
    let temp: LooseObject = this.youtubeService.getUser(this.token);
    this.user = temp['user'];
    this.uploads = temp['videos'];
  }

  test(): void {
    this.youtubeService.getPlaylist(this.token, this.user.uploads);
  }
}
