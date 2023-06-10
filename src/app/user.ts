import { Thumbnail } from "./thumbnail";

export interface User {
    channelName: string;
    channelDescription: string;
    customURL: string;
    id: string;
    likes: string;
    uploads: string;
    timeOnPLatform: string;
    thumbnails: Thumbnail[];
    // defaultThumbnail: Thumbnail;
    // mediumThumbnail: Thumbnail;
    // highThumbnail: Thumbnail;
}
