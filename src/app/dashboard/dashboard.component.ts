import { Component, inject, SimpleChanges, ViewEncapsulation } from '@angular/core';
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
  // encapsulation: ViewEncapsulation.Emulated
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
  languages: string[] | any = [];
  filteredLanguages: string[] | any = [];
  langSelected: boolean = false;
  userHasNoVideos: boolean = false;
  demoVideos: Video[] = [];
  grabbingNewVideos: boolean = false;
  errorMessage: string = "Something went wrong!";
  infoMessage: string = "Hello!";
  messageTimer: number = 10000;

  constructor() { }

  getRandomInt(): number {
    let min = Math.ceil(1);
    let max = Math.floor(4);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  flipLangSelect(): void {

    if (this.langSelected) {
      $("#db-flag-select").css({"height": `calc(45px * ${this.languages.length})`});  // , "border-radius": "22.5px"
    } else {
      $("#db-flag-select").css({"height": "45px"});  //,  "border-radius": "50%"
    }
    this.langSelected = !this.langSelected;
  }

  updateFailedButton(): void {
    // let but: any;
    let ind: any;

    try {
      // but = document.getElementById("left-button");
      ind = document.getElementById("db-left-button-indicator");
    } catch (error) {
      // //console.log("]]]]", error);
    }

    if (this.failedFilter) {
      // but.classList.remove('left-click-inactive');
      // but.classList.add('left-click-active');

      ind.classList.remove('db-indicator-inactive');
      ind.classList.add('db-indicator-active');

      this.shownVideos = this.failedVideos;

    } else {
      // but.classList.remove('left-click-active');
      // but.classList.add('left-click-inactive');

      ind.classList.remove('db-indicator-active');
      ind.classList.add('db-indicator-inactive');

      this.shownVideos = this.uploads;
    }
  }

  updateInProgressButton(): void {
    // let but: any;
    let ind: any;

    try {
      // but = document.getElementById("mid-button");
      ind = document.getElementById("db-mid-button-indicator");
    } catch (error) {
      return;
    }

    if (this.inProgressFilter) {
      // but.classList.remove('mid-click-inactive');
      // but.classList.add('mid-click-active');

      ind.classList.remove('db-indicator-inactive');
      ind.classList.add('db-indicator-active');

      this.shownVideos = this.inProgressVideos;
    } else {
      // but.classList.remove('mid-click-active');
      // but.classList.add('mid-click-inactive');

      ind.classList.remove('db-indicator-active');
      ind.classList.add('db-indicator-inactive');

      this.shownVideos = this.uploads;
    }
  }

  updateDoneButton(): void {
    // let but: any;
    let ind: any;

    try {
      // but = document.getElementById("right-button");
      ind = document.getElementById("db-right-button-indicator");
    } catch (error) {
      return;
    }

    if (this.doneFilter) {
      // but.classList.remove('right-click-inactive');
      // but.classList.add('right-click-active');

      ind.classList.remove('db-indicator-inactive');
      ind.classList.add('db-indicator-active');

      this.shownVideos = this.doneVideos;
    } else {
      // but.classList.remove('right-click-active');
      // but.classList.add('right-click-inactive');

      ind.classList.remove('db-indicator-active');
      ind.classList.add('db-indicator-inactive');

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

    this.transcriptionService.getSupportedLanguages("dashboard").then((res) => {
      this.languages = res;

      var prms: string | null= localStorage.getItem('lang');

      if (prms) {
        this.lang = prms;
        this.langSelected = true;
        this.filteredLanguages = this.languages.filter((l: string) => {
          return l != this.lang
        });
        // //console.log("rrr", this.lang, this.languages, this.filteredLanguages);
      } else {
        this.openModal();
      }
    }).catch((res) => {
      this.openError("We encountered an error while fetching our supported languages. Details: ".concat(res['detail']));
      setTimeout(() => {this.closeError()}, this.messageTimer);

    });

    

    this.authService.getUserAsync(this.session).then((res) => {
      this.user = res;

      let typemap: LooseObject = {};

      localStorage.setItem('JYUID', JSON.stringify({ "session_id": this.session, "user_id": this.user.id }) );

      this.transcriptionService.getPlaylistAsync(this.session, res.id, "dashboard").then((r) => {

        this.uploads = r["items"] as Video[]; //this.repeat(r, 6);

        if (this.uploads.length == 0) {
          this.userHasNoVideos = true;
        } else {
          this.shownVideos = this.uploads;
          this.failedVideos = this.uploads.filter((item: Video) => { return item.status === "FAILED" });
          this.inProgressVideos = this.uploads.filter((item: Video) => { return (item.status === "IN_PROGRESS" || item.status === "CREATED") });
          this.doneVideos = this.uploads.filter((item: Video) => { return (item.status === "COMPLETED" || item.status === "UPDATED" || item.status === "UPLOADED") });
        }
      });
    }).catch((res) => {
      this.openError("Error fetching User Info");
      setTimeout(() => {this.closeError()}, this.messageTimer);
    });

    setInterval(() => {this.grabVideos()}, 10000);
    
  }

  grabVideos(): void {
    if (!this.userHasNoVideos) {
      this.transcriptionService.getPlaylistAsync(this.session, this.user.id, "dashboard").then((r) => {
        
        this.uploads = r["items"] as Video[];
        this.shownVideos = this.uploads;
        this.failedVideos = this.uploads.filter((item: Video) => { return item.status === "FAILED" });
        this.inProgressVideos = this.uploads.filter((item: Video) => { return (item.status === "IN_PROGRESS" || item.status === "CREATED") });
        this.doneVideos = this.uploads.filter((item: Video) => { return (item.status === "COMPLETED" || item.status === "UPDATED" || item.status === "UPLOADED") });
      });
    } 
  }

  openModal(): void {
    $("#db-myModal").css("display", "flex");

    var lang: string | null= localStorage.getItem('lang');

    if (lang) {
      $(`#db-lang_${lang}`).focus();
    } 
  }

  openError(message: string) {
    this.closeInfo();
    this.errorMessage = message;
    $("#db-warning").css("top", "10px");
  }

  closeError() {
    $("#db-warning").css("top", "-100px");
    // this.errorMessage = "Something went wrong!";
  }

  openInfo(message: string) {
    this.closeError();
    this.infoMessage = message;
    $("#db-info").css("top", "10px");
  }

  closeInfo() {
    $("#db-info").css("top", "-100px");
    // this.infoMessage = "Hello!";
  }

  signOut(): void {
    localStorage.removeItem("JYUID"); 
  }

  syncVideos(): void {
    if (!this.userHasNoVideos) {
      this.transcriptionService.updateUserVideos(this.session, this.user.id, "dashboard").then((res: any) => {
        // console.log("ddddd", res);

        this.uploads = res["items"] as Video[]; //this.repeat(r, 6);
  
  
        this.shownVideos = this.uploads;
  
        this.failedVideos = this.uploads.filter((item: Video) => { return item.status === "FAILED" });
        this.inProgressVideos = this.uploads.filter((item: Video) => { return (item.status === "IN_PROGRESS" || item.status === "CREATED") });
        this.doneVideos = this.uploads.filter((item: Video) => { return (item.status === "COMPLETED" || item.status === "UPDATED" || item.status === "UPLOADED") });
        this.openInfo("We succesfully pulled new videos from your YouTube channel!");
        setTimeout(() => {this.closeInfo()}, this.messageTimer);
      }).catch((res) => {
        this.openError("We encountered an error while attempting to sync. Details: ".concat(res['detail']));
        setTimeout(() => {this.closeError()}, this.messageTimer);
  
      });
    }
    
  }

  getDemoVideos(): void {
    this.transcriptionService.getDemoVideos("dashboard").then((res) => {
      // //console.log(">>>>>>", res);
      this.demoVideos = res as Video[];

      this.shownVideos = this.demoVideos;
      this.failedVideos = this.uploads.filter((item: Video) => { return item.status === "FAILED" });
      this.inProgressVideos = this.uploads.filter((item: Video) => { return (item.status === "IN_PROGRESS" || item.status === "CREATED") });
      this.doneVideos = this.uploads.filter((item: Video) => { return (item.status === "COMPLETED" || item.status === "UPDATED" || item.status === "UPLOADED") });
    }).catch((res) => {
      this.openError("We encountered an error while fetching demo videos for you. Details: ".concat(res['detail']));
      setTimeout(() => {this.closeError()}, this.messageTimer);

    });
  }

  setLang(lang: string): void {
    this.lang = lang;

    this.filteredLanguages = this.languages.filter((l: string) => {
      return l != this.lang
    });

    localStorage.setItem('lang', lang);
  }

  closeModal(): void {
    $("#db-myModal").css("display", "none");

    var prms: string | null= localStorage.getItem('lang');

    if (prms) {
      this.lang = prms;

      this.flipLangSelect();
    } else {
      this.openModal();
      // //console.log("Iinjn");
      $("#db-modal_title").text("Please Select a Language :)");
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

  // ngOnChanges(changes: SimpleChanges) {
  //   // this.failedVideos = this.uploads.filter((item: Video) => { item.type === 3 });
  //   // this.inProgressVideos = this.uploads.filter((item: Video) => { item.type === 4 });
  //   // this.doneVideos = this.uploads.filter((item: Video) => { item.type === 2 });
  //   //console.log("llpp", changes);

  // }

  onKey(event: LooseObject) {
    this.searchString = event['target'].value;

    this.filterVids();
    // //console.log(this.searchString);
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
