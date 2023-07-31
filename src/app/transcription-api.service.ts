import { Injectable } from '@angular/core';
import { LooseObject } from './loose-object';

@Injectable({
  providedIn: 'root'
})
export class TranscriptionApiService {

  constructor() { }

  getResults(videoID: string): Promise<LooseObject[]> {

    return new Promise((resolve, reject) => {
      var req = new XMLHttpRequest();


      req.open('GET', `http://byacu.com:8000/results?url=${videoID}`);

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
}
