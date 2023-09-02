import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Video } from '../video';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AuthApiService } from '../auth-api.service';
import { TranscriptionApiService } from '../transcription-api.service';
import { LooseObject } from '../loose-object';
import * as $ from 'jquery';

let apiLoaded = false;

@Component({
  selector: 'app-transcription-detail',
  templateUrl: './transcription-detail.component.html',
  styleUrls: ['./transcription-detail.component.css']
})
export class TranscriptionDetailComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  id!: string; 
  youtubeService: AuthApiService = inject(AuthApiService);
  transcriptionService: TranscriptionApiService = inject(TranscriptionApiService);
  url: string = "";
  player: any;
  reframed: Boolean = false;
  transcriptions!: LooseObject[];
  immutableTranscriptions!: LooseObject[];
  currIndex: number = 0;
  maxSeen: number = 4;
  replaceTxt: string = "";
  searchTxt: string = "";
  prevFiveIndex: number[] = [this.currIndex - this.maxSeen, this.currIndex - 1];
  videoListener: any;

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

  constructor(private _router: Router, private ref: ChangeDetectorRef) {
  }


  ngOnInit() {
    
    this.id = String(this.route.snapshot.params['id']);

    this.init();

    // escape(`https://www.youtube.com/watch?v=${this.id}`)

    this.transcriptionService.getResults(this.id, "p").then((res) => {
      this.transcriptions = res;
      this.immutableTranscriptions = res;
      // console.log(res);
    });

    
  }

  getProgress(): number {
    return ((this.currIndex + 1) / this.transcriptions.length ) * 100;
  }

  updateReplaceTxt(event: any): void {
    this.replaceTxt = event.target.value;
  }

  updateSearchTxt(event: any): void {
    this.searchTxt = event.target.value;
    this.currIndex = 0;

    this.transcriptions = this.immutableTranscriptions.filter((item: LooseObject) => {
      return item['text'].toLowerCase().includes(this.searchTxt.toLowerCase());
    });
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

      $("#focus-item").focus();
      $("#focus-item").attr('contenteditable','true');

      this.ref.detectChanges();
    // }
    

    console.log("jjjjj", this.currIndex);
  }

  next(): void {

    if (this.currIndex < this.transcriptions.length) {
      this.currIndex += 1;
      this.prevFiveIndex[0] += 1;
      this.prevFiveIndex[1] += 1;
    }

    $("#focus-item").focus();
    $("#focus-item").attr('contenteditable','true');
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
