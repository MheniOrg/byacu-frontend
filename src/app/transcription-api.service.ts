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

    req.open('POST', `https://byacu.com/transcribe?video_id=${videoId}&user_id=${userId}&language=${language}`);


    req.onreadystatechange = (e) => {

      if (req.readyState === 4) {
        if (req.status === 200) {
          let res = JSON.parse(req.response);

          //console.log(res);

          resolve(res);
  
        } else {
          reject(JSON.parse(req.response));
        }
      }
      
    }

    req.onerror = (e) => {
      //console.error(req.statusText);
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
      req.onreadystatechange = (e) => {

        if (req.readyState === 4) {
          if (req.status === 200) {
            let res = JSON.parse(req.response);

          res.items.forEach((item: { text: string | any[]; }) => {
            if (item.text.length < 1) {
              item.text = "..."
            }
          });
            
          resolve(res.items);
          } else {
            reject(JSON.parse(req.response));
          }
        } 
      }

      req.onerror = (e) => {
        //console.error(req.statusText);
      };

      req.send(null);
    });

  }

  getPlaylistAsync(credentials: string, userId: string, page: string): Promise<LooseObject> {
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
            reject(JSON.parse(req.response));
          }
        }
        
      }

      req.onerror = (e) => {
        //console.error(req.statusText);
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
            reject(JSON.parse(req.response));
          }
        }
        
      }

      req.onerror = (e) => {
        //console.error(req.statusText);
        reject(req.statusText);
      };

      req.send(null);

    });
  }


  // No payload for transcriptions ????
  updateTranscriptions(credentials: string, userId: string, videoId: string, payload: string, page: string) {
    return new Promise((resolve, reject) => { 

      var req = new XMLHttpRequest();

      req.open('POST', `https://byacu.com/update_transcriptions?video_id=${videoId}&session_id=${credentials}&user_id=${userId}`);
      
      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

      req.onreadystatechange = (e) => {

        if (req.readyState === 4) {
          if (req.status === 200) {
            let res = JSON.parse(req.response);

            resolve(res);

            // //console.log(res);
    
          } 
          else {
            reject(JSON.parse(req.response));
          }
        }
        
      }

      req.onerror = (e) => {
        //console.error(req.statusText);
        reject(req.statusText);
      };

      req.send(`json_data=${encodeURIComponent(payload)}`);

    });
  }

  uploadTranscriptions(credentials: string, userId: string, videoId: string, page: string) {
    return new Promise((resolve, reject) => { 

      var req = new XMLHttpRequest();

      req.open('POST', `https://byacu.com/upload_transcriptions?video_id=${videoId}&session_id=${credentials}&user_id=${userId}`);
      
      // req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

      req.onreadystatechange = (e) => {

        if (req.readyState === 4) {
          if (req.status === 200) {
            let res = JSON.parse(req.response);

            resolve(res);

            //console.log(res);
    
          } 
          else {
            reject(JSON.parse(req.response));
          }
        }
        
      }

      req.onerror = (e) => {
        //console.error(req.statusText);
        reject(req.statusText);
      };

      req.send(null);

    });
  }

  // Should be a get but is a post
  getSupportedLanguages(page: string) {
    return new Promise((resolve, reject) => { 

      var req = new XMLHttpRequest();

      req.open('GET', `https://byacu.com/supported_languages`);

      req.onreadystatechange = (e) => {

        if (req.readyState === 4) {
          if (req.status === 200) {
            let res = JSON.parse(req.response);

            resolve(res);
    
          } 
          else {
            reject(JSON.parse(req.response));
          }
        }
        
      }

      req.onerror = (e) => {
        //console.error(req.statusText);
        reject(req.statusText);
      };

      req.send(null);

    });
  }

  getVideos(videoId: string, page: string) {
    return new Promise((resolve, reject) => { 

      var req = new XMLHttpRequest();

      req.open('GET', `https://byacu.com/video?video_id=${videoId}`);

      req.onreadystatechange = (e) => {

        if (req.readyState === 4) {
          if (req.status === 200) {
            let res = JSON.parse(req.response);
            resolve(res);
    
          } 
          else {
            reject(JSON.parse(req.response));
          }
        }
        
      }

      req.onerror = (e) => {
        //console.error(req.statusText);
        reject(req.statusText);
      };

      req.send(null);

    });
  }

  getDemoVideos(page: string) {
    return new Promise((resolve, reject) => { 

      var req = new XMLHttpRequest();

      req.open('GET', `https://byacu.com/demo_videos`);

      req.onreadystatechange = (e) => {

        if (req.readyState === 4) {
          if (req.status === 200) {
            let res = JSON.parse(req.response);
            resolve(res);
    
          } 
          else {
            reject(JSON.parse(req.response));
          }
        }
        
      }

      req.onerror = (e) => {
        //console.error(req.statusText);
        reject(req.statusText);
      };

      req.send(null);

    });
  }

  // isDemoUser(credentials: string, userId: string) {
  //   return new Promise((resolve, reject) => { 
  
  //     var req = new XMLHttpRequest();
  
  //     req.open('GET', `https://byacu.com/is_demo_user?session_id=${credentials}&user_id=${userId}`);
  
  //     req.onreadystatechange = (e) => {
  
  //       if (req.readyState === 4) {
  //         if (req.status === 200) {
  //           let res = JSON.parse(req.response);

  //           console.log(res);
  
  //           resolve(res);
    
  //         } 
  //         else {
  //           reject(JSON.parse(req.response));
  //         }
  //       }
        
  //     }
  
  //     req.onerror = (e) => {
  //       //console.error(req.statusText);
  //       reject(req.statusText);
  //     };
  
  //     req.send(null);
  
  //   });
  // }
}


