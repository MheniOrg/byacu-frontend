import { Thumbnail } from "./thumbnail";

export interface Video {
    video_id: string;
    captions_id: string;
    status: string;
    url: string;
    language: string;
    user_id: string;
    s3_location: string;
    pull_time: string;
    title: string;
    timeOnPLatform: string;
    channelId: string;
    description: string;
    thumbnail: string;
}

/*

{
  "video_id": "watch?v=xeuA3C5RpVY",
  "pull_time": "1691344122.240518",
  "captions_id": "AUieDaYo-5Rs94bsPPmCwvR5lQEHaw4KA2PMTdKJ8DRwAjXJcoUAK05S_Q",
  "status": "COMPLETED",
  "thumbnails": "[{'type': 'default', 'url': 'https://i.ytimg.com/vi/xeuA3C5RpVY/default.jpg', 'width': 120, 'height': 90}, {'type': 'medium', 'url': 'https://i.ytimg.com/vi/xeuA3C5RpVY/mqdefault.jpg', 'width': 320, 'height': 180}, {'type': 'high', 'url': 'https://i.ytimg.com/vi/xeuA3C5RpVY/hqdefault.jpg', 'width': 480, 'height': 360}]",
  "url": "https://www.youtube.com/watch?v=xeuA3C5RpVY",
  "language": "Wolof",
  "user_id": "UCszksueaNucOy3SebHthVGw",
  "channelId": "UCszksueaNucOy3SebHthVGw",
  "s3_location": "transcriptions/watch?v=xeuA3C5RpVY.json",
  "description": "",
  "timeOnPlatform": "2023-07-11T03:55:14Z",
  "title": "WIKITONGUES： Aminah Abba speaking Wolof"
}

*/
