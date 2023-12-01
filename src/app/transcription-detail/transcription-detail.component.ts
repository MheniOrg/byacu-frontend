import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Video } from '../video';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AuthApiService } from '../auth-api.service';
import { TranscriptionApiService } from '../transcription-api.service';
import { LooseObject } from '../loose-object';
import * as $ from 'jquery';
import { User } from '../user';
import moment from 'moment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

let apiLoaded = false;

@Component({
  selector: 'app-transcription-detail',
  templateUrl: './transcription-detail.component.html',
  styleUrls: ['./transcription-detail.component.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '(window:resize)': 'onResize($event)'
  }
})
export class TranscriptionDetailComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  id!: string; 
  authService: AuthApiService = inject(AuthApiService);
  transcriptionService: TranscriptionApiService = inject(TranscriptionApiService);
  url: string = "";
  player: any;
  reframed: Boolean = false;
  shownTranscriptions!: LooseObject[];
  transcriptions!: LooseObject[];
  immutableTranscriptions!: LooseObject[];
  currIndex: number = 0;
  maxSeen: number = 4;
  replaceTxt: string = "";
  searchTxt: string = "";
  prevFiveIndex: number[] = [this.currIndex - this.maxSeen, this.currIndex - 1];
  videoListener: any;
  user!: User;
  credentials: string = "";
  video: LooseObject | undefined;
  uploadInProgress: boolean = false;
  resetInProgress: boolean = false;
  saveInProgress: boolean = false;
  retranscribeInProgress: boolean = false;
  errorMessage: string = "Something went wrong!";
  infoMessage: string = "Hello!";
  showError: boolean = true;
  loaderText: string = "Reseting...";
  messageTimer: number = 10000;
  lang: string = "";
  languages: string[] | any = [];
  langSelected: boolean = false;
  filteredLanguages: string[] | any = [];
  mobile = false;
  isDemoUser: boolean = false;

  init() {
    // Return if Player is already created
    // if ((<any>window)['YT']) {
      
    //   this.startVideo();
    //   return;
    // }

    if ((<any>window)['YT']) {
      (<any>window)['YT'] = null;
  
      if(this.player){
       this.player.destroy();
      }
      this.init();
    }

    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];

    if(firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      this.init();
    }
    

    /* 3. startVideo() will create an <iframe> (and YouTube player) after the API code downloads. */
    (<any>window)['onYouTubeIframeAPIReady'] = () => this.startVideo();
  }

  flipLangSelect(): void {

    if (this.langSelected) {
      $("#td-flag-select").css({"height": `calc(45px * ${this.languages.length})`});
    } else {
      $("#td-flag-select").css({"height": "45px"});
    }
    this.langSelected = !this.langSelected;
  }

  startVideo() {
    this.reframed = false;
    this.player = new window['YT'].Player('td-player', {
      videoId: this.id,
      // width: "100%",
      
      playerVars: {
        modestbranding: 1,
        controls: 1,
        disablekb: 1,
        rel: 0,
        fs: 0,
        playsinline: 1,
        loop: 1,
        enablejsapi: 1
      },
      events: {
        'onStateChange': (event) => { this.onPlayerStateChange(event); },
        'onError': this.onPlayerError.bind(this),
        'onReady': this.onPlayerReady.bind(this),
      }
    });
  }

  /* 4. It will be called when the Video Player is ready */
  onPlayerReady(event: { target: { mute: () => void; playVideo: () => void; }; }) {
    // if (this.isRestricted) {
    //   event.target.mute();
    //   event.target.playVideo();
    // } else {
    //   event.target.playVideo();
    // }
    // event.target.playVideo();
    // event.target.mute();
    
    
  }

  /* 5. API will call this function when Player State changes like PLAYING, PAUSED, ENDED */
  onPlayerStateChange(event: { data: any; }) {

    this.matchTranscriptionsToVideo();
    switch (event.data) {
      case window['YT'].PlayerState.PLAYING:
        this.setupVideoListener();
        if (this.cleanTime() == 0) {
          // //console.log('started ' + this.cleanTime());
        } else {
          // //console.log('playing ' + this.cleanTime())
        };
        break;
      case window['YT'].PlayerState.PAUSED:
        if (this.player.getDuration() - this.player.getCurrentTime() != 0) {
          // //console.log('paused' + ' @ ' + this.cleanTime());
        };
        clearInterval(this.videoListener);
        break;
      case window['YT'].PlayerState.ENDED:
        // //console.log('ended ');
        clearInterval(this.videoListener);
        break;
    };

    
  };

  cleanTime() {
    return Math.round(this.player.getCurrentTime())
  };

  setupVideoListener(): void {

    if (this.videoListener) {
      clearInterval(this.videoListener);
    }

    this.makeEditable(this.currIndex);
    this.videoListener = setInterval(() => { this.matchTranscriptionsToVideo(); }, 1000);
  }

  jumpTo(idx: number) {
    this.player.seekTo(idx * 5);
    this.currIndex = idx;

    this.matchTranscriptionsToVideo();

    this.makeEditable(idx);

    this.ref.detectChanges();
  }

  updateChanges() {
    this.saveInProgress = true;
    this.transcriptionService.updateTranscriptions(this.credentials, this.user.id, this.id, JSON.stringify(this.transcriptions), "https://justyams.com/dashboard").then((res) => {
      let temp = res as LooseObject;
      this.immutableTranscriptions = JSON.parse(JSON.stringify(this.transcriptions)) as LooseObject[];
      this.saveInProgress = false;
      this.transcriptionService.getVideos(this.id, "transcription_page").then((res) => {
        this.video = res as LooseObject;
      });
      this.openInfo(temp["message"]);
      setTimeout(() => {this.closeInfo()}, this.messageTimer);
    }).catch((res) => {
      this.saveInProgress = false;
      this.openError(res['detail']);
      setTimeout(() => {this.closeError()}, this.messageTimer);

    });
  }
  
  uploadChanges() {
    this.uploadInProgress = true;
    this.transcriptionService.updateTranscriptions(this.credentials, this.user.id, this.id, JSON.stringify(this.transcriptions), "https://justyams.com/dashboard").then((res) => {
      this.immutableTranscriptions = JSON.parse(JSON.stringify(this.transcriptions)) as LooseObject[];

      this.transcriptionService.uploadTranscriptions(this.credentials, this.user.id, this.id, "https://justyams.com/dashboard").then((res) => {
        let temp = res as LooseObject;
        this.openInfo(temp["message"]);
        this.uploadInProgress = false;
        this.transcriptionService.getVideos(this.id, "transcription_page").then((res) => {
          this.video = res as LooseObject;
        });
        setTimeout(() => {this.closeInfo()}, this.messageTimer);
      }).catch((res) => {
        this.uploadInProgress = false;
        this.openError(res['detail']);
        setTimeout(() => {this.closeError()}, this.messageTimer);
      });
    }).catch((res) => {
      this.uploadInProgress = false;
      this.openError(res['detail']);
      setTimeout(() => {this.closeError()}, this.messageTimer);
    });
  }

  transcribe(): void {
    if (this.video) {
      this.retranscribeInProgress = true;
      this.transcriptionService.transcribe(this.video["video_id"], this.video["user_id"], this.lang, 'dashboard').then((res) => {
        this.retranscribeInProgress = false;
        this.openInfo(`Succesfully started your re-transcribe request. Sending you back to the dashboard in ${this.messageTimer/5000} seconds!`);
        setTimeout(() => { this.closeInfo(); this.navigateToDashboard();}, this.messageTimer/5);
      }).catch((res) => {
        this.retranscribeInProgress = false;
        this.openError(`Retranscribe failed for the following reason: ${res['detail']}`);
        setTimeout(() => {this.closeError()}, this.messageTimer);
      });
    }
  }

  onPlayerError(event: { data: any; }) {
    let reason;
    switch (event.data) {
      case 2:
        reason = "Invalid VideoID";
        break;
      case 5:
        reason = "HTML5 player error";
        break;
      case 100:
        reason = "Video not found. Set to private or removed.";
        break;
      case 101 || 150:
        reason = "Video owner blocked access to video";
        break;
    };
    this.openError(`Something bad happened: ${reason}.<br> Try Refreshing this tab.`);
    setTimeout(() => {this.closeError()}, this.messageTimer);
  };

  constructor(private _router: Router, private ref: ChangeDetectorRef, private sanitizer: DomSanitizer) {
  }

  onResize(event: any) {
    if (window.screen.width <= 600) { // 768px portrait
      this.mobile = true;
    } else {
      this.mobile = false
    }
  }

  ngOnInit() {


    
    
    this.id = String(this.route.snapshot.params['id']);

    if (window.screen.width <= 600) { // 768px portrait
      this.mobile = true;
    }

    

    this.init();

    // this.startVideo();
    

    this.credentials = this.authService.getCredentials();

    this.authService.getUserAsync(this.credentials).then((res) => {
      this.user = res;

      // if ("UCYXxZjLl_DGUo-ikYrkCPFw" == this.user.id ){
      if ("UCYXxZjLl_DGUo-ikYrkCPFw" == this.user.id  && "@mhenidevs" != this.user.customURL) {
        this.isDemoUser = true;
      }
    }).catch((res) => {
      this.openError(res['detail']);
      setTimeout(() => {this.closeError()}, this.messageTimer);
    });

    this.transcriptionService.getVideos(this.id, "transcription_page").then((res) => {
      this.video = res as LooseObject;
    }).catch((res) => {
      this.openError(res['detail']);
      setTimeout(() => {this.closeError()}, this.messageTimer);
    });

    this.transcriptionService.getSupportedLanguages("dashboard").then((res) => {
      this.languages = res;

      var prms: string | null= localStorage.getItem('lang');

      if (prms) {
        this.lang = prms;
        this.langSelected = true;
        this.filteredLanguages = this.languages.filter((l: string) => {
          return l != this.lang
        });

      } else {
        this.lang = `${this.video ? this.video["language"] : "Kinyarwanda"}`;
        this.langSelected = true;
        this.filteredLanguages = this.languages.filter((l: string) => {
          return l != this.lang
        });
      }
    }).catch((res) => {
      this.openError(res['detail']);
      setTimeout(() => {this.closeError()}, this.messageTimer);
    });

    this.transcriptionService.getResults(this.id, "p").then((res) => {
      this.shownTranscriptions = JSON.parse(JSON.stringify(res)) as LooseObject[];
      this.transcriptions = JSON.parse(JSON.stringify(res)) as LooseObject[];
      this.immutableTranscriptions = JSON.parse(JSON.stringify(res)) as LooseObject[];

      this.transcriptions.forEach((item, idx, arr) => {
        let i = this.transcriptions[idx]["text"]; 
        this.transcriptions[idx]["html"] = this.sanitizer.bypassSecurityTrustHtml(i);
        this.immutableTranscriptions[idx]["html"] = this.sanitizer.bypassSecurityTrustHtml(i);
        this.shownTranscriptions[idx]["html"] = this.sanitizer.bypassSecurityTrustHtml(i);
      });

    }).catch((res) => {
      this.openError(res['detail']);
      setTimeout(() => {this.closeError()}, this.messageTimer);
    });

    setTimeout(() => {this.topOfTranscriptions();}, 1000);
    
    
  }

  setLang(lang: string): void {
    this.lang = lang;

    this.filteredLanguages = this.languages.filter((l: string) => {
      return l != this.lang
    });

    localStorage.setItem('lang', lang);
  }

  openError(message: string) {
    this.closeInfo();
    this.errorMessage = message;
    $("#td-warning").css("top", "10px");
  }

  closeError() {
    $("#td-warning").css("top", "-100px");
    // this.errorMessage = "Something went wrong!";
  }

  openInfo(message: string) {
    this.closeError();
    this.infoMessage = message;
    $("#td-info").css("top", "10px");
  }

  closeInfo() {
    $("#td-info").css("top", "-100px");
    // this.infoMessage = "Hello!";
  }

  formatDate(since: boolean): string {
    if (this.video) {
      if (since) {
        return moment.unix(this.video['last_uploaded']).fromNow();
      } else {
        return moment.unix(this.video['last_uploaded']).format("LLLL");
      }
    } else {
      return ""
    }
  }

  getProgress(): number {
    if (this.transcriptions) {
      return ((this.currIndex + 1) / this.transcriptions.length ) * 100;
    }else {
      return 0;
    }
  }

  updateReplaceTxt(event: any): void {
    this.replaceTxt = event.target.value;

    if (this.player.getPlayerState() == 1){
      this.player.pauseVideo()
    }
  }

  updateSearchTxt(event: any): void {
    this.searchTxt = event.target.value;
    this.currIndex = 0;

    this.shownTranscriptions = this.transcriptions.filter((item: LooseObject) => {
      return item['text'].toLowerCase().includes(this.searchTxt.toLowerCase());
    });

    this.shownTranscriptions.forEach((item, idx, arr) => {
      let i = this.shownTranscriptions[idx]["text"].replaceAll(this.searchTxt, "<span>".concat(this.searchTxt, "</span>"));
      this.shownTranscriptions[idx]["html"] =  this.sanitizer.bypassSecurityTrustHtml(i);
    });

    if (this.player.getPlayerState() == 1){
      this.player.pauseVideo()
    }
  }

  replace(): void {
    this.transcriptions.forEach((item, idx, arr) => {
      let i;
      if (this.searchTxt.length > 0) {
        i = this.transcriptions[idx]["text"].replaceAll(this.searchTxt, this.replaceTxt);
      } else {
        i = this.transcriptions[idx]["text"];
      }

      this.transcriptions[idx]["text"] = i;
      this.transcriptions[idx]["html"] =  this.sanitizer.bypassSecurityTrustHtml(i);
    });

    this.shownTranscriptions = this.transcriptions.filter((item: LooseObject) => {
      return item['text'].toLowerCase().includes(this.searchTxt.toLowerCase());
    });
  }

  resetTranscriptions(): void {
    this.resetInProgress = true;
    this.transcriptions = JSON.parse(JSON.stringify(this.immutableTranscriptions)) as LooseObject[];
    
    this.transcriptions.forEach((item, idx, arr) => {
      let i = this.transcriptions[idx]["text"];
      this.transcriptions[idx]["html"] = this.sanitizer.bypassSecurityTrustHtml(i);
    });

    this.shownTranscriptions = this.transcriptions.filter((item: LooseObject) => {
      return item['text'].toLowerCase().includes(this.searchTxt.toLowerCase());
    });

    this.shownTranscriptions.forEach((item, idx, arr) => {
      let i;
      if (this.searchTxt.length > 0) {
        i = this.shownTranscriptions[idx]["text"].replaceAll(this.searchTxt, "<span>".concat(this.searchTxt, "</span>"));
      } else {
        i = this.shownTranscriptions[idx]["text"];
      }

      this.shownTranscriptions[idx]["html"] =  this.sanitizer.bypassSecurityTrustHtml(i);
    });

    setTimeout(() => { this.resetInProgress = false; }, 200);
  }

  saveChangeBlur(total_idx: number, filtered_idx: number, event: any) {
    let i;
    if (this.searchTxt.length > 0) {
      i = event.target.innerText.replaceAll(this.searchTxt, "<span>".concat(this.searchTxt, "</span>"));
    } else {
      i = event.target.innerText;
    }
    
    this.shownTranscriptions[filtered_idx]["text"] =  event.target.innerText;
    this.shownTranscriptions[filtered_idx]["html"] =  this.sanitizer.bypassSecurityTrustHtml(i);

    this.transcriptions[total_idx]["text"] =  event.target.innerText;
    this.transcriptions[total_idx]["html"] =  this.sanitizer.bypassSecurityTrustHtml(i);

    let ele = $(`#td-transcription-item-${total_idx}`);

    // ele.focus();
    // ele.attr('contenteditable','false');
    ele.focus();
    ele.attr('spellcheck','false');
  }

  makeEditable(idx: number) {
    let ele = $(`#td-transcription-item-${idx}`);
    // ele.focus();
    // ele.attr('contenteditable','true');

    ele.focus();
    ele.attr('spellcheck','true');
  }

  topOfTranscriptions() {
    let container = $('#td-transcriptions-id');
    container.scrollTop(0);
  }

  matchTranscriptionsToVideo(): void {
    let temp = Math.floor(this.cleanTime()/5);

    if (temp != this.currIndex) {
      this.currIndex = temp

      let parent = $('#td-transcriptions-id');
      let child = $(`#td-grouped-transcription-item-${this.currIndex}`);
      let parentPosition: any;
      let parentScrollTop: any;
      let childPosition: any;
      if (child) {
        childPosition = child.offset();
        if (childPosition) {
          childPosition = childPosition.top;
        }
      }

      if (parent) {
        parentPosition = parent.offset();
        parentScrollTop = parent.scrollTop();
        if (parentPosition) {
          parentPosition = parentPosition.top;
        }
      }

      if (parentPosition && childPosition) {

        parent.animate({
          scrollTop: `${(childPosition - parentPosition + parentScrollTop) - 100}px`
        }, 300);

        this.makeEditable(this.currIndex);
      } 
    }
  }


  // Dispose the player OnDestroy
  ngOnDestroy() {
    // if (this.player) {
    //   this.player.dispose();
      
    // }

    // if (window['YT']) {
    //   window.YT = null;
    // }

    (<any>window)['onYouTubeIframeAPIReady'] = null;
    if (this.player) {
      this.player.destroy();
    }

    clearInterval(this.videoListener);
  }

  navigateToDashboard() {
    this._router.navigateByUrl('/dashboard')
  }

}
