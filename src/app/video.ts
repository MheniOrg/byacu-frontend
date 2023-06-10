import { Thumbnail } from "./thumbnail";

export interface Video {
    id: string;
    title: string;
    timeOnPLatform: string;
    channelId: string;
    description: string;
    thumbnails: Thumbnail[];
}
