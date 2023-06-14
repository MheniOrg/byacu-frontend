import { Component, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { YoutubeApiService } from '../youtube-api.service';
import { User } from '../user';
import { Video } from '../video';
import { StrictObject } from '../strict-object';
import { LooseObject } from '../loose-object';
import { Thumbnail } from '../thumbnail';
import { UserDisplayComponent } from '../user-display/user-display.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  youtubeService: YoutubeApiService = inject(YoutubeApiService);
  fragmentString = location.hash.substring(1);
  token!: string;
  user: User = {
    channelName: '',
    channelDescription: '',
    customURL: '',
    id: '',
    likes: '',
    uploads: '',
    timeOnPLatform: '',
    thumbnails: []
  };
  uploads!: Video[];
  shownVideos!: Video[];
  YOUR_CLIENT_ID: string  = environment.YOUR_CLIENT_ID;
  YOUR_REDIRECT_URI: string = environment.YOUR_REDIRECT_URI;

  constructor() { }

  repeat(array: Video[], n:number){
    var out: Video[] = [];
    for(var i = 0; i < n; i++) {
        out = out.concat(array);
    }
    return out;
  }

  ngOnInit() { 
    // Parse query string to see if page request is coming from OAuth 2.0 server.
    this.youtubeService.consumeOathToken();
    this.token = this.youtubeService.getCredentials();

    this.youtubeService.getUserAsync(this.token).then((res) => {
      this.user = res;

      this.youtubeService.getPlaylistAsync(this.token, res.uploads).then((r) => {
        this.uploads = r;
        this.shownVideos = this.repeat(this.uploads, 3);
        console.log(r);
      });
    });

  }

  test(): void {
    // let temp: LooseObject = this.youtubeService.getUser(this.token);
    // this.user = temp['user'];
    // this.uploads = temp['videos'];

    
  }
}
