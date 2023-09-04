import { Injectable } from '@angular/core';
import { LooseObject } from './loose-object';
import { AuthApiService } from './auth-api.service';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranscriptionApiService {
  authService: AuthApiService = inject(AuthApiService);

  constructor() { }

  // No sessionId requirment??
  transcribe(videoId: string, userId: string, language: string, page: string): Promise<LooseObject> {
    return new Promise((resolve, reject) => { 


    var req = new XMLHttpRequest();

    // req.open('GET', 'https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails&mine=true' + '&access_token=' + credentials, true);

    req.open('POST', `https://byacu.com/transcribe?video_id=${videoId}&user_id=${userId}&language=${language}`);


    req.onreadystatechange = (e) => {

      if (req.readyState === 4) {
        if (req.status === 200) {
          let res = JSON.parse(req.response);

          console.log(res);

          resolve(res);
  
        } else {
          this.authService.refreshAuth(page);
        }
      }
      
    }

    req.onerror = (e) => {
      console.error(req.statusText);
      reject(req.statusText);
    };

    req.send(null);

    });
  }

  // No sessionId requirment??
  getResults(videoID: string, page: string): Promise<LooseObject[]> {
    return new Promise((resolve, reject) => {
      var req = new XMLHttpRequest();


      req.open('GET', `https://byacu.com/results?video_id=${videoID}`);

      // req.setRequestHeader("Access-Control-Allow-Origin", '*');

      // req.withCredentials = true;

      req.onreadystatechange = (e) => {

        if (req.readyState === 4) {
          let res = JSON.parse(req.response);

          console.log(res);

          // let temp = res.items;

          res.items.forEach((item: { text: string | any[]; }) => {
            if (item.text.length < 1) {
              item.text = "..."
            }
          });
            
          resolve(res.items);
        }
        
      }

      req.onerror = (e) => {
        console.error(req.statusText);
      };

      req.send(null);
    });

  }

  getPlaylistAsync(credentials: string, userId: string, typemap: LooseObject, page: string): Promise<LooseObject> {
    return new Promise((resolve, reject) => { 

      var req = new XMLHttpRequest();

      // req.open('GET', 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&playlistId=' + playlistId + '&access_token=' + credentials, true);

      req.open('get', `https://byacu.com/user_videos?session_id=${credentials}&user_id=${userId}`);

      req.onreadystatechange = (e) => {

        if (req.readyState === 4) {
          if (req.status === 200) {
            let res = JSON.parse(req.response);

            resolve(res);
    
          } 
          else {
            this.authService.refreshAuth(page);
          }
        }
        
      }

      req.onerror = (e) => {
        console.error(req.statusText);
        reject(req.statusText);
      };

      req.send(null);

    });
  }

  updateUserVideos(credentials: string, userId: string, page: string) {
    return new Promise((resolve, reject) => { 

      var req = new XMLHttpRequest();

      req.open('POST', `https://byacu.com/update_user_videos?session_id=${credentials}&user_id=${userId}`);

      req.onreadystatechange = (e) => {

        if (req.readyState === 4) {
          if (req.status === 200) {
            let res = JSON.parse(req.response);

            resolve(res);
    
          } 
          else {
            this.authService.refreshAuth(page);
          }
        }
        
      }

      req.onerror = (e) => {
        console.error(req.statusText);
        reject(req.statusText);
      };

      req.send(null);

    });
  }

  // No payload for transcriptions ????
  uploadTranscriptions(credentials: string, userId: string, videoId: string, page: string) {
    return new Promise((resolve, reject) => { 

      var req = new XMLHttpRequest();

      req.open('POST', `https://byacu.com/upload_transcriptions?video_id=${videoId}&session_id=${credentials}&user_id=${userId}`);

      req.onreadystatechange = (e) => {

        if (req.readyState === 4) {
          if (req.status === 200) {
            let res = JSON.parse(req.response);

            resolve(res);
    
          } 
          else {
            this.authService.refreshAuth(page);
          }
        }
        
      }

      req.onerror = (e) => {
        console.error(req.statusText);
        reject(req.statusText);
      };

      req.send(null);

    });
  }

  // Should be a get but is a post
  getSupportedLanguages(page: string) {
    return new Promise((resolve, reject) => { 

      var req = new XMLHttpRequest();

      req.open('POST', `https://byacu.com/supported_languages`);

      req.onreadystatechange = (e) => {

        if (req.readyState === 4) {
          if (req.status === 200) {
            let res = JSON.parse(req.response);

            resolve(res);
    
          } 
          else {
            this.authService.refreshAuth(page);
          }
        }
        
      }

      req.onerror = (e) => {
        console.error(req.statusText);
        reject(req.statusText);
      };

      req.send(null);

    });
  }
}
