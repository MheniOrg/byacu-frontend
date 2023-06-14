import { Component, Input } from '@angular/core';
import { Video } from '../video';
// import { YouTubePlayerModule } from '@angular/youtube-player';

@Component({
  selector: 'app-video-card',
  templateUrl: './video-card.component.html',
  styleUrls: ['./video-card.component.css']
})
export class VideoCardComponent {
  @Input() videoInfo!: Video;
}
