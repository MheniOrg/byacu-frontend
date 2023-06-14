import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserDisplayComponent } from './user-display/user-display.component';
import { VideoCardComponent } from './video-card/video-card.component';
import { IconComponent } from './icon/icon.component';

// import { YouTubePlayerModule } from '@angular/youtube-player';

let apiLoaded = false;


@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    DashboardComponent,
    UserDisplayComponent,
    VideoCardComponent,
    IconComponent
  ],
  imports: [
    BrowserModule,
    // YouTubePlayerModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { 
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
