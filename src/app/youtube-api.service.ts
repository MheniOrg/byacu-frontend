import { Injectable } from '@angular/core';
import { User } from './user';
import { Video } from './video';
import { StrictObject } from './strict-object';
import { LooseObject } from './loose-object';
import { Thumbnail } from './thumbnail';
import { environment } from '../environments/environment';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class YoutubeApiService {
  YOUR_CLIENT_ID: string  = environment.YOUR_CLIENT_ID;
  YOUR_REDIRECT_URI: string = environment.YOUR_REDIRECT_URI;
  constructor() { }


  /*
   * Create form to request access token from Google's OAuth 2.0 server.
   */
  oauth2SignIn(YOUR_CLIENT_ID: string, YOUR_REDIRECT_URI: string): void {
    // Google's OAuth 2.0 endpoint for requesting an access token
    var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    // Create element to open OAuth 2.0 endpoint in new window.
    var form = document.createElement('form');
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    let params: StrictObject = {'client_id': YOUR_CLIENT_ID,
                  'redirect_uri': YOUR_REDIRECT_URI,
                  'scope': 'https://www.googleapis.com/auth/youtube.force-ssl',
                  'state': 'dashboard_login',
                  'include_granted_scopes': 'true',
                  'response_type': 'token'};

    // Add form parameters as hidden input values.
    ['client_id', 'redirect_uri', 'scope', 'state', 'include_granted_scopes', 'response_type'].forEach((p) => {
      let input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', p);
      input.setAttribute('value', params[p]);
      form.appendChild(input);
    });

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
  }

  // If there's an access token, try an API request.
  // Otherwise, start OAuth 2.0 flow.
  trySampleRequest(YOUR_CLIENT_ID: string, YOUR_REDIRECT_URI: string): void {
    var prms: string | null = localStorage.getItem('oauth2-test-params');
    var params;
    if (prms) {
      params = JSON.parse(prms);
    }
          
    
    if (params && params['access_token']) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET',
          'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&' +
          'access_token=' + params['access_token']);

      xhr.onreadystatechange = (e) => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          console.log(xhr.response);
        } else if (xhr.readyState === 4 && xhr.status === 401) {
          // Token invalid, so prompt for user permission.
          this.oauth2SignIn(YOUR_CLIENT_ID, YOUR_REDIRECT_URI);
        }
      };
      xhr.send(null);
    } else {
      this.oauth2SignIn(YOUR_CLIENT_ID, YOUR_REDIRECT_URI);
    }
  }

  // Parse query string to see if page request is coming from OAuth 2.0 server.
  consumeOathToken(): void {
    var params: LooseObject = {};

    var regex = /([^&=]+)=([^&]*)/g, m;
    while (m = regex.exec(location.hash.substring(1))) {
      params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    if (Object.keys(params).length > 0) {
      localStorage.setItem('oauth2-test-params', JSON.stringify(params) );

    }

    history.pushState("", document.title, window.location.pathname + window.location.search);

  }

  getCredentials(): string {
    var prms: string | null = localStorage.getItem('oauth2-test-params');

    // console.log(location.hash.length);

    var params: LooseObject = {};
    if (prms) {
      params = JSON.parse(prms);
    } else {
      this.oauth2SignIn(this.YOUR_CLIENT_ID, this.YOUR_REDIRECT_URI);
    }

    return params["access_token"];
  }

  refreshAuth() {
    localStorage.removeItem('oauth2-test-params');
    this.oauth2SignIn(this.YOUR_CLIENT_ID, this.YOUR_REDIRECT_URI);
  }

  getPlaylist(credentials: string, playlistId: string): Video[] {

    let playlist: Video[] = [];

    var req = new XMLHttpRequest();

    req.open('GET', 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&playlistId=' + playlistId + '&access_token=' + credentials);

    req.onreadystatechange = (e) => {

      if (req.readyState === 4) {
        if (req.status === 200) {
          let res = JSON.parse(req.response);

          res.items.forEach((videoObj: LooseObject) => {
            let video: Video = {id: "", title: "", type: 1, timeOnPLatform: "", channelId: "", description: "", thumbnails: []};

            video.channelId = videoObj['snippet'].channelId;
            video.id = videoObj['snippet'].resourceId.videoId;
            video.title = videoObj['snippet'].title;
            video.description = videoObj['snippet'].description;

            let timeOnPLatform = moment(videoObj['snippet'].publishedAt);

            video.timeOnPLatform = timeOnPLatform.fromNow();

            video.thumbnails = [];

            ["default", "medium", "high"].forEach((typ) => {
              let temp = videoObj['snippet'].thumbnails[typ];

              video.thumbnails.push({ type: typ,  url: temp.url, width: temp.width, height: temp.height});
            });

            playlist.push(video);

          });
  
        } 
        else {
          this.refreshAuth();
        }
      }
      
    }

    req.onerror = (e) => {
      console.error(req.statusText);
    };

    req.send(null);


    return playlist;
  }

  testEndpoint(): void {

    var req = new XMLHttpRequest();


    req.open('GET', 'http://byacu.com:8000/oauth_redirect');

    req.setRequestHeader("Access-Control-Allow-Origin", '*');

    // req.withCredentials = true;

    req.onreadystatechange = (e) => {

      if (req.readyState === 4) {
        // let res = JSON.parse(req.response);
          
        console.log(req);
      }
      
    }

    req.onerror = (e) => {
      console.error(req.statusText);
    };

    req.send(null);

  }

  testEndpoint2(): void {

    var req = new XMLHttpRequest();

    req.open('POST', 'http://byacu.com:8000/transcribe?url="kt2D7xl06mk"&user_id="jumbalayafanfanwe"');

    req.onreadystatechange = (e) => {

      if (req.readyState === 4) {
        let res = JSON.parse(req.response);
          
        console.log(res);
      }
      
    }

    req.onerror = (e) => {
      console.error(req.statusText);
    };

    req.send(null);

  }

  getPlaylistAsync(credentials: string, playlistId: string, typemap: LooseObject): Promise<Video[]> {
    return new Promise((resolve, reject) => { 

      var req = new XMLHttpRequest();

      req.open('GET', 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&playlistId=' + playlistId + '&access_token=' + credentials, true);

      req.onreadystatechange = (e) => {

        if (req.readyState === 4) {
          if (req.status === 200) {
            let res = JSON.parse(req.response);
            let playlist: Video[] = [];

            res.items.forEach((videoObj: LooseObject) => {
              let video: Video = {id: "", title: "", type: 1, timeOnPLatform: "", channelId: "", description: "", thumbnails: []};

              video.channelId = videoObj['snippet'].channelId;
              video.id = videoObj['snippet'].resourceId.videoId;
              video.title = videoObj['snippet'].title;
              video.description = videoObj['snippet'].description;

              let timeOnPLatform = moment(videoObj['snippet'].publishedAt);

              video.timeOnPLatform = timeOnPLatform.fromNow();

              video.thumbnails = [];

              ["default", "medium", "high"].forEach((typ) => {
                let temp = videoObj['snippet'].thumbnails[typ];

                video.thumbnails.push({ type: typ,  url: temp.url, width: temp.width, height: temp.height});
              });

              
              video.type = 3; // typemap[video.id];
              playlist.push(video);
            });

            resolve(playlist);
    
          } 
          else {
            this.refreshAuth();
          }
        }
        
      }

      req.onerror = (e) => {
        console.error(req.statusText);
        reject(req.statusText);
      };

      req.send(null);


      // return playlist;
    });
  }

  getUser(credentials: string): LooseObject {

    let user: User = {id: "###", likes: "###", uploads: "###", channelName: "###", channelDescription: "###", customURL: "###", timeOnPLatform: "###", thumbnails: []};
    let videos: Video[] = [];
    let result: LooseObject = {};

    var req = new XMLHttpRequest();

    req.open('GET', 'https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails&mine=true' + '&access_token=' + credentials);

    req.onreadystatechange = (e) => {

      if (req.readyState === 4) {
        if (req.status === 200) {
          let res = JSON.parse(req.response);

          let timeOnPLatform = moment(res.items[0].snippet.publishedAt);

          user.id = res.items[0].id;
          user.uploads = res.items[0].contentDetails.relatedPlaylists.uploads;
          user.likes = res.items[0].contentDetails.relatedPlaylists.likes;
          user.channelName = res.items[0].snippet.title;
          user.channelDescription = res.items[0].snippet.description;
          user.customURL = res.items[0].snippet.customUrl;
          user.timeOnPLatform = timeOnPLatform.fromNow();

          user.thumbnails = [];

          ["default", "medium", "high"].forEach((typ) => {
            let temp = res.items[0].snippet.thumbnails[typ];
            user.thumbnails.push({ type: typ,  url: temp.url, width: temp.width, height: temp.height});
          });

          // Get uploads
          videos = this.getPlaylist(credentials, user.uploads);

          result['user'] = user;
          result['videos'] = videos;
  
        } else {
          this.refreshAuth();
        }
      }
      
    }

    req.send(null);

    console.log(result);

    return result;
  }


  getUserAsync(credentials: string): Promise<User> {
    return new Promise((resolve, reject) => { 

    let user: User = {id: "###", likes: "###", uploads: "###", channelName: "###", channelDescription: "###", customURL: "###", timeOnPLatform: "###", thumbnails: []};
    // let videos: Video[] = [];
    // let result: LooseObject = {};

    var req = new XMLHttpRequest();

    req.open('GET', 'https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails&mine=true' + '&access_token=' + credentials, true);

    req.onreadystatechange = (e) => {

      if (req.readyState === 4) {
        if (req.status === 200) {
          let res = JSON.parse(req.response);

          let timeOnPLatform = moment(res.items[0].snippet.publishedAt);

          user.id = res.items[0].id;
          user.uploads = res.items[0].contentDetails.relatedPlaylists.uploads;
          user.likes = res.items[0].contentDetails.relatedPlaylists.likes;
          user.channelName = res.items[0].snippet.title;
          user.channelDescription = res.items[0].snippet.description;
          user.customURL = res.items[0].snippet.customUrl;
          user.timeOnPLatform = timeOnPLatform.fromNow();

          user.thumbnails = [];

          ["default", "medium", "high"].forEach((typ) => {
            let temp = res.items[0].snippet.thumbnails[typ];
            user.thumbnails.push({ type: typ,  url: temp.url, width: temp.width, height: temp.height});
          });

          resolve(user);
  
        } else {
          this.refreshAuth();
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