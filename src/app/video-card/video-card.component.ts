import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Video } from '../video';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { CommonModule } from '@angular/common';
import { TranscriptionApiService } from '../transcription-api.service';

@Component({
  selector: 'app-video-card',
  templateUrl: './video-card.component.html',
  styleUrls: ['./video-card.component.css'],
  standalone: true,
  imports: [
    YouTubePlayerModule,
    CommonModule
  ]
})
export class VideoCardComponent {
  @Input() videoInfo!: Video;
  @Input() id!: number;
  transcriptionService: TranscriptionApiService = inject(TranscriptionApiService);
  @Input() lang!: string;
  @Output() transcribeButtonClicked = new EventEmitter<string>();

  y: string = "https://i.ytimg.com/vi/hifMYHbVELU/hq720.jpg";
  z: string = "The Sound of the Kinyarwanda language (Numbers, Greetings, Words & Prayer)";

  /*

  f,f,f -> (New) Transcribe
  f,f,t -> (Done) Re-Transcribe + View/Edit Results
  f,t,f -> (Failed) Re-Transcribe + No Results :(
  t,f,f -> (In Progress) Loader

  */

  constructor(private _router: Router) { }


  ngOnInit() {
    
  }

  ngAfterViewInit() {
    // this.test();
  }

  navigateToVideoDetail(): void {
    this._router.navigateByUrl(`/transcription/${this.videoInfo.video_id}`);
  }

  addButtons(type: number): void {
    let parent = document.getElementById(`button-case-${this.id}`);


    if (parent) {
      parent.innerHTML = '';

      if (type === 1) {
        let button1: string = '<button class="button1">Transcribe</button>';
        
        parent.insertAdjacentHTML('beforeend', button1);

      } else if (type === 2) {
        let button1: string = '<button class="retranscribe-button">Re-Transcribe</button>';
        let button2: string = '<button class="view-edit-button">View/Edit Results</button>';
        
        parent.insertAdjacentHTML('beforeend', button1);
        parent.insertAdjacentHTML('beforeend', button2);

      } else if (type === 3) {
        let button1: string = '<button class="failed-button">Sorry, it seems like this job failed. \n Try Again?</button>';
        
        parent.insertAdjacentHTML('beforeend', button1);

      } else if (type === 4) {
        let button1: string = '<div class="loader-button"><div class="loader"></div></div>';
        
        parent.insertAdjacentHTML('beforeend', button1);

      }

    } else {
      console.log("fffff");
    }

    
  }

  transcribe(): void {
    this.transcriptionService.transcribe(this.videoInfo.video_id, this.videoInfo.user_id, this.lang, 'dashboard').then((res) => {
      this.transcribeButtonClicked.emit();
    });
  }

}
