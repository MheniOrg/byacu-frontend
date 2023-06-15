import { Component, Input } from '@angular/core';
import { Video } from '../video';
import { YouTubePlayerModule } from '@angular/youtube-player';

let apiLoaded = false;

@Component({
  selector: 'app-video-card',
  templateUrl: './video-card.component.html',
  styleUrls: ['./video-card.component.css'],
  standalone: true,
  imports: [
    YouTubePlayerModule
  ]
})
export class VideoCardComponent {
  @Input() videoInfo!: Video;
  @Input() transcribed!: boolean;
  @Input() hasResults!: boolean;


  ngOnInit() {
    if (!apiLoaded) {
      // This code loads the IFrame Player API code asynchronously, according to the instructions at
      // https://developers.google.com/youtube/iframe_api_reference#Getting_Started
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      apiLoaded = true;
    }
  }
}
