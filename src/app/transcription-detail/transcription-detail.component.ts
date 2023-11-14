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
  encapsulation: ViewEncapsulation.None
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
  errorMessage: string = "Something went wrong!";
  infoMessage: string = "Hello!";
  showError: boolean = true;
  loaderText: string = "Reseting...";

  init() {
    // Return if Player is already created
    if (window['YT']) {
      this.startVideo();
      return;
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

  startVideo() {
    this.reframed = false;
    this.player = new window['YT'].Player('player', {
      videoId: this.id,
      width: "100%",
      
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
    // console.log("jg6g8g", this.player);
  }

  /* 5. API will call this function when Player State changes like PLAYING, PAUSED, ENDED */
  onPlayerStateChange(event: { data: any; }) {
    // console.log(event)
    this.matchTranscriptionsToVideo();
    switch (event.data) {
      case window['YT'].PlayerState.PLAYING:
        this.setupVideoListener();
        if (this.cleanTime() == 0) {
          console.log('started ' + this.cleanTime());

          
        } else {
          console.log('playing ' + this.cleanTime())
        };
        break;
      case window['YT'].PlayerState.PAUSED:
        if (this.player.getDuration() - this.player.getCurrentTime() != 0) {
          console.log('paused' + ' @ ' + this.cleanTime());
        };
        clearInterval(this.videoListener);
        break;
      case window['YT'].PlayerState.ENDED:
        console.log('ended ');
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

    this.videoListener = setInterval(() => { this.matchTranscriptionsToVideo(); }, 1000);
  }

  jumpTo(idx: number) {
    this.player.seekTo(idx * 5);
    // this.currIndex = idx;

    this.matchTranscriptionsToVideo();

    this.makeEditable(idx);

    this.ref.detectChanges();
  }

  updateChanges() {
    this.saveInProgress = true;
    this.transcriptionService.updateTranscriptions(this.credentials, this.user.id, this.id, JSON.stringify(this.transcriptions), "https://justyams.com/dashboard").then((res) => {
      console.log("Ss", res);
      let temp = res as LooseObject;
      this.saveInProgress = false;
      this.openInfo(temp["message"]);
      setTimeout(() => {this.closeInfo()}, 10000);
    }).catch((res) => {
      console.log("Sffs", res);
      this.saveInProgress = false;
      this.openError(res['detail']);
      setTimeout(() => {this.closeError()}, 3000);

    });
    // console.log("dddddd");
  }
  
  uploadChanges() {
    this.transcriptionService.uploadTranscriptions(this.credentials, this.user.id, this.id, "https://justyams.com/dashboard") 
    // console.log("l;");
  }

  onPlayerError(event: { data: any; }) {
    switch (event.data) {
      case 2:
        // console.log('' + this.video)
        break;
      case 100:
        break;
      case 101 || 150:
        break;
    };
  };

  constructor(private _router: Router, private ref: ChangeDetectorRef, private sanitizer: DomSanitizer) {
  }


  ngOnInit() {
    
    this.id = String(this.route.snapshot.params['id']);

    this.init();

    this.credentials = this.authService.getCredentials();

    this.authService.getUserAsync(this.credentials).then((res) => {
      this.user = res;
    });

    this.transcriptionService.getVideos(this.id, "transcription_page").then((res) => {
      this.video = res as LooseObject;
    });

    this.transcriptionService.getResults(this.id, "p").then((res) => {
      this.shownTranscriptions = res;
      this.transcriptions = res;
      this.immutableTranscriptions = res;


      this.transcriptions.forEach((item, idx, arr) => {
        let i = this.transcriptions[idx]["text"]; //.replace(this.searchTxt, "<span>".concat(this.searchTxt, "</span>"));
        this.transcriptions[idx]["html"] = this.sanitizer.bypassSecurityTrustHtml(i);
        this.immutableTranscriptions[idx]["html"] = this.sanitizer.bypassSecurityTrustHtml(i);
        this.shownTranscriptions[idx]["html"] = this.sanitizer.bypassSecurityTrustHtml(i);
      });

    });

  //   setTimeout(() => {
  //     this.openError("");
  //     setTimeout(() => {this.closeError()}, 3000);
  
  // }, 500);

  // setTimeout(() => {
  //   this.openInfo("");
  //   setTimeout(() => {this.closeInfo()}, 3000);

  // }, 500);

    
  }

  openError(message: string) {
    this.errorMessage = message;
    $("#warning").css("top", "10px");
  }

  closeError() {
    $("#warning").css("top", "-100px");
    this.errorMessage = "Something went wrong!";
  }

  openInfo(message: string) {
    this.infoMessage = message;
    $("#info").css("top", "10px");
  }

  closeInfo() {
    $("#info").css("top", "-100px");
    this.infoMessage = "Hello!";
  }

  formatDate(since: boolean): string {
    // return "";
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
  }

  updateSearchTxt(event: any): void {
    this.searchTxt = event.target.value;
    this.currIndex = 0;

    this.shownTranscriptions = this.transcriptions.filter((item: LooseObject) => {
      return item['text'].toLowerCase().includes(this.searchTxt.toLowerCase());
    });

    // this.transcriptions.forEach((item, idx, arr) => {
    //   let i = this.transcriptions[idx]["text"].replace(this.searchTxt, "<span>".concat(this.searchTxt, "</span>"));
    //   this.transcriptions[idx]["html"] =  this.sanitizer.bypassSecurityTrustHtml(i);
    // });

    this.shownTranscriptions.forEach((item, idx, arr) => {
      let i = this.shownTranscriptions[idx]["text"].replaceAll(this.searchTxt, "<span>".concat(this.searchTxt, "</span>"));
      this.shownTranscriptions[idx]["html"] =  this.sanitizer.bypassSecurityTrustHtml(i);
    });
    
  }

  replace(): void {
    this.transcriptions.forEach((item, idx, arr) => {
      let i = this.transcriptions[idx]["text"].replaceAll(this.searchTxt, this.replaceTxt);
      this.transcriptions[idx]["text"] = i;
      this.transcriptions[idx]["html"] =  this.sanitizer.bypassSecurityTrustHtml(i);
    });

    this.shownTranscriptions = this.transcriptions.filter((item: LooseObject) => {
      return item['text'].toLowerCase().includes(this.searchTxt.toLowerCase());
    });

    

    // this.shownTranscriptions.forEach((item, idx, arr) => {
    //   let i = this.shownTranscriptions[idx]["text"].replaceAll(this.searchTxt, "<span>".concat(this.searchTxt, "</span>"));
    //   this.shownTranscriptions[idx]["html"] =  this.sanitizer.bypassSecurityTrustHtml(i);
    // });
  }

  resetTranscriptions(): void {
    this.resetInProgress = true;
    // console.log("p", JSON.parse(JSON.stringify(this.immutableTranscriptions)));
    this.transcriptions = JSON.parse(JSON.stringify(this.immutableTranscriptions)) as LooseObject[];
    this.shownTranscriptions = this.transcriptions.filter((item: LooseObject) => {
      return item['text'].toLowerCase().includes(this.searchTxt.toLowerCase());
    });

    this.shownTranscriptions.forEach((item, idx, arr) => {
      let i = this.shownTranscriptions[idx]["text"].replaceAll(this.searchTxt, "<span>".concat(this.searchTxt, "</span>"));
      this.shownTranscriptions[idx]["html"] =  this.sanitizer.bypassSecurityTrustHtml(i);
    });

    setTimeout(() => { this.resetInProgress = false; }, 200);
  }

  saveChangeBlur(total_idx: number, filtered_idx: number, event: any) {
    // console.log(">", total_idx);
    // console.log(">", filtered_idx);
    console.log(">", event.target.innerText);

    // let new_text = event.target.innerHTML.replace("<span>", "");
    // new_text = new_text.replace("</span>", "");

    // console.log(">k>", new_text);

    let i = event.target.innerText.replaceAll(this.searchTxt, "<span>".concat(this.searchTxt, "</span>"));

    this.shownTranscriptions[filtered_idx]["text"] =  event.target.innerText;
    this.shownTranscriptions[filtered_idx]["html"] =  this.sanitizer.bypassSecurityTrustHtml(i);

    this.transcriptions[total_idx]["text"] =  event.target.innerText;
    this.transcriptions[total_idx]["html"] =  this.sanitizer.bypassSecurityTrustHtml(i);

    let ele = $(`#transcription-item-${total_idx}`);

    ele.focus();
    ele.attr('contenteditable','false');
  }

  saveChangeKey(total_idx: number, filtered_idx: number, event: any) {
    // console.log(">", total_idx);
    // console.log(">", filtered_idx);
    // console.log(">", event.target.innerText);

    let i = event.target.innerText.replaceAll(this.searchTxt, "<span>".concat(this.searchTxt, "</span>"));

    event.preventDefault();

    this.shownTranscriptions[filtered_idx]["text"] =  event.target.innerText;
    this.shownTranscriptions[filtered_idx]["html"] =  this.sanitizer.bypassSecurityTrustHtml(i);

    this.transcriptions[total_idx]["text"] =  event.target.innerText;
    this.transcriptions[total_idx]["html"] =  this.sanitizer.bypassSecurityTrustHtml(i);

    
  }

  makeEditable(idx: number) {

    let ele = $(`#transcription-item-${idx}`);

    

    // if (!ele.is(":focus")) {
    //   ele.html(ele.text());
    // }
    ele.focus();
    
    ele.attr('contenteditable','true');
    

    // ele = $(`#transcription-item-${idx} span`);

    // ele.focus();
    // ele.attr('contenteditable','false');

  }


  test(): void {
    // this.player.pauseVideo();

    // let temp = document.getElementById("player");

    // console.log(this.player.playerInfo.currentTime);
    // console.log(window['YT']);

    // console.log(this.transcriptions);
    this.currIndex += 10;
    this.prevFiveIndex[0] += 10;
    this.prevFiveIndex[1] += 10;

    $("#focus-item").focus();
    $("#focus-item").attr('contenteditable','true');

  }

  matchTranscriptionsToVideo(): void {
    // let f = this.cleanTime();

    // if (this.currIndex != Math.floor(f/5)) {
      this.currIndex = Math.floor(this.cleanTime()/5);

      this.prevFiveIndex[0] = this.currIndex - this.maxSeen;
      this.prevFiveIndex[1] = this.currIndex - 1;

      // $("#focus-item").focus();
      // $("#focus-item").attr('contenteditable','true');

      
    // }
    

    // console.log("jjjjj", this.currIndex);
  }

  next(): void {

    // if (this.currIndex < this.transcriptions.length) {
    //   this.currIndex += 1;
    //   this.prevFiveIndex[0] += 1;
    //   this.prevFiveIndex[1] += 1;
    // }

    // $("#focus-item").focus();
    // $("#focus-item").attr('contenteditable','true');

    
  }

  prev(): void {

    if (this.currIndex > 0) {
      this.currIndex -= 1;
      this.prevFiveIndex[0] -= 1;
      this.prevFiveIndex[1] -= 1;
    }

    $("#focus-item").focus();
    $("#focus-item").attr('contenteditable','true');
  }

  last(): void {

    this.currIndex = this.transcriptions.length - 1;
    this.prevFiveIndex[0] = this.currIndex - this.maxSeen;
    this.prevFiveIndex[1] = this.currIndex - 1;

    $("#focus-item").focus();
    $("#focus-item").attr('contenteditable','true');
  }

  first(): void {

    this.currIndex = 0;
    this.prevFiveIndex[0] = this.currIndex - this.maxSeen;
    this.prevFiveIndex[1] = this.currIndex - 1;

    $("#focus-item").focus();
    $("#focus-item").attr('contenteditable','true');
    
  }


  // Dispose the player OnDestroy
  ngOnDestroy() {
    // if (this.player) {
    //   this.player.dispose();
      
    // }

    // if (window['YT']) {
    //   window.YT = null;
    // }

    clearInterval(this.videoListener);
  }

  navigateToDashboard() {
    this._router.navigateByUrl('/dashboard')
  }

}
