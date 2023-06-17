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
  failedVideos!: Video[];
  inProgressVideos!: Video[];
  doneVideos!: Video[];
  YOUR_CLIENT_ID: string  = environment.YOUR_CLIENT_ID;
  YOUR_REDIRECT_URI: string = environment.YOUR_REDIRECT_URI;
  searchString: string = "";
  failedFilter: boolean = false;
  inProgressFilter: boolean = false;
  doneFilter: boolean = false;
  videoType: number[] = [];

  constructor() { }

  getRandomInt(): number {
    let min = Math.ceil(1);
    let max = Math.floor(4);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  updateFailedButton(): void {
    let but: any;

    try {
      but = document.getElementById("left-button");
    } catch (error) {
      return;
    }

    if (this.failedFilter) {
      but.classList.remove('left-click-inactive');
      but.classList.add('left-click-active');

      this.shownVideos = this.failedVideos;

    } else {
      but.classList.remove('left-click-active');
      but.classList.add('left-click-inactive');

      this.shownVideos = this.uploads;
    }
  }

  updateInProgressButton(): void {
    let but: any;

    try {
      but = document.getElementById("mid-button");
    } catch (error) {
      return;
    }

    if (this.inProgressFilter) {
      but.classList.remove('mid-click-inactive');
      but.classList.add('mid-click-active');

      this.shownVideos = this.inProgressVideos;
    } else {
      but.classList.remove('mid-click-active');
      but.classList.add('mid-click-inactive');

      this.shownVideos = this.uploads;
    }
  }

  updateDoneButton(): void {
    let but: any;

    try {
      but = document.getElementById("right-button");
    } catch (error) {
      return;
    }

    if (this.doneFilter) {
      but.classList.remove('right-click-inactive');
      but.classList.add('right-click-active');

      this.shownVideos = this.doneVideos;
    } else {
      but.classList.remove('right-click-active');
      but.classList.add('right-click-inactive');

      this.shownVideos = this.uploads;
    }
  }

  flipFailed(): void {
    this.failedFilter = !this.failedFilter;


    if (this.failedFilter) {
      this.inProgressFilter = false;
      this.doneFilter = false;

      this.updateDoneButton();
      this.updateInProgressButton();
    } 

    this.updateFailedButton();
    this.filterVids();
  }

  flipInProgress(): void {
    this.inProgressFilter = !this.inProgressFilter;

    if (this.inProgressFilter) {
      this.failedFilter = false;
      this.doneFilter = false;

      this.updateDoneButton();
      this.updateFailedButton();
    } 

    this.updateInProgressButton();
    this.filterVids();
  }

  flipDone(): void {
    this.doneFilter = !this.doneFilter;

    if (this.doneFilter) {
      this.failedFilter = false;
      this.inProgressFilter = false;

      this.updateInProgressButton();
      this.updateFailedButton();
    } 

    this.updateDoneButton();

    this.filterVids();
  }

  repeat(array: Video[], n:number){
    var out: Video[] = [];
    for(var i = 0; i < n; i++) {
      for(var j = 0; j < array.length; j++) {
        let uf: Video =  {
          id: array[j].id,
          title: array[j].title,
          type: 0,
          timeOnPLatform: array[j].timeOnPLatform,
          channelId: array[j].channelId,
          description: array[j].description,
          thumbnails: array[j].thumbnails
        };

        out.push(uf);
      }
      // out.concat(array);
    }
    return out;
  }

  ngOnInit() { 
    // Parse query string to see if page request is coming from OAuth 2.0 server.
    this.youtubeService.consumeOathToken();
    this.token = this.youtubeService.getCredentials();

    this.youtubeService.getUserAsync(this.token).then((res) => {
      this.user = res;

      let typemap: LooseObject = {};

      // ["test"] 

      this.youtubeService.getPlaylistAsync(this.token, res.uploads, typemap).then((r) => {

        this.uploads = this.repeat(r, 6);
 
        for (let i:number = 0; i < 12; i++ ) {
          this.uploads[i].type = this.getRandomInt();
        }

        // console.log(this.uploads);

        this.shownVideos = this.uploads;

        this.failedVideos = this.uploads.filter((item: Video) => { return item.type === 3 });
        this.inProgressVideos = this.uploads.filter((item: Video) => { return item.type === 4 });
        this.doneVideos = this.uploads.filter((item: Video) => { return item.type === 2 });
      });
    });

    // for (let i:number = 0; i < 12; i++ ) {
    //   this.videoType.push(this.getRandomInt());
    // }

    // console.log(this.videoType);
    

  }

  filterVids(): void {

    if (this.failedFilter) {
      this.shownVideos = this.failedVideos.filter(
        (vid: Video) => vid.title.toLowerCase().includes(this.searchString.toLowerCase())
      );
    } else if (this.doneFilter) {
      this.shownVideos = this.doneVideos.filter(
        (vid: Video) => vid.title.toLowerCase().includes(this.searchString.toLowerCase())
      );
    } else if (this.inProgressFilter) {
      this.shownVideos = this.inProgressVideos.filter(
        (vid: Video) => vid.title.toLowerCase().includes(this.searchString.toLowerCase())
      );
    } else {
      this.shownVideos = this.uploads.filter(
        (vid: Video) => vid.title.toLowerCase().includes(this.searchString.toLowerCase())
      );
    }
    
  }

  ngOnChanges() {
    // this.failedVideos = this.uploads.filter((item: Video) => { item.type === 3 });
    // this.inProgressVideos = this.uploads.filter((item: Video) => { item.type === 4 });
    // this.doneVideos = this.uploads.filter((item: Video) => { item.type === 2 });

  }

  onKey(event: LooseObject) {
    this.searchString = event['target'].value;

    this.filterVids();
    // console.log(this.searchString);
  }

  test(): void {
    // let temp: LooseObject = this.youtubeService.getUser(this.token);
    // this.user = temp['user'];
    // this.uploads = temp['videos'];

    
  }
}
