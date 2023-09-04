import { Component, inject } from '@angular/core';
// import { environment } from '../../environments/environment';
import { AuthApiService } from '../auth-api.service';
import { TranscriptionApiService } from '../transcription-api.service';
import { User } from '../user';
import { Video } from '../video';
import { StrictObject } from '../strict-object';
import { LooseObject } from '../loose-object';
import { Thumbnail } from '../thumbnail';
import { UserDisplayComponent } from '../user-display/user-display.component';
import * as $ from 'jquery';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  authService: AuthApiService = inject(AuthApiService);
  transcriptionService: TranscriptionApiService = inject(TranscriptionApiService);
  fragmentString = location.hash.substring(1);
  session!: string;
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
  // YOUR_CLIENT_ID: string  = environment.YOUR_CLIENT_ID;
  // YOUR_REDIRECT_URI: string = environment.YOUR_REDIRECT_URI;
  searchString: string = "";
  failedFilter: boolean = false;
  inProgressFilter: boolean = false;
  doneFilter: boolean = false;
  videoType: number[] = [];
  lang: string = "";

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


  ngOnInit() { 
    // Parse query string to see if page request is coming from OAuth 2.0 server.
    this.authService.consumeOathToken();
    this.session = this.authService.getCredentials();

    var prms: string | null= localStorage.getItem('lang');

    if (prms) {
      this.lang = prms;
    } else {
      this.openModal();
    }

    

    this.authService.getUserAsync(this.session).then((res) => {
      this.user = res;

      let typemap: LooseObject = {};

      this.transcriptionService.getPlaylistAsync(this.session, res.id, typemap, "dashboard").then((r) => {

        // console.log(r);
        
        this.uploads = r["items"] as Video[]; //this.repeat(r, 6);
 

        this.shownVideos = this.uploads;

        console.log(this.uploads);

        this.failedVideos = this.uploads.filter((item: Video) => { return item.status === "FAILED" });
        this.inProgressVideos = this.uploads.filter((item: Video) => { return item.status === "IN_PROGRESS" });
        this.doneVideos = this.uploads.filter((item: Video) => { return (item.status === "COMPLETED" || item.status === "UPDATED") });
      
      });
    });

    // for (let i:number = 0; i < 12; i++ ) {
    //   this.videoType.push(this.getRandomInt());
    // }

    // console.log(this.videoType);
    

  }

  openModal(): void {
    $("#myModal").css("display", "flex");
  }

  closeModal(): void {
    $("#myModal").css("display", "none");

    var prms: string | null= localStorage.getItem('lang');

    if (prms) {
      this.lang = prms;
    } else {
      this.openModal();
    }
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

  storeLang(lang: string): void {
    localStorage.setItem('lang', lang);
  }

  test(): void {
    // let temp: LooseObject = this.authService.getUser(this.session);
    // this.user = temp['user'];
    // this.uploads = temp['videos'];

    
  }
}
