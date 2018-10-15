import { PhotoPostAttachment } from "./PhotoPostAttachment";
import { PostAttachment } from "./PostAttachment";
import { AttachmentType } from "./AttachmentType";

export enum PostMediaType
{
    Empty,

    PhotoVideoOnly,
    DocumentOnly,
    AudioOnly,
    TextOnly,
    Unhandled,
    Mixed,

    TextAndPhotoVideo,
    TextAndMultiplePhotoVideo,
    MultiplePhotoVideo,

    TextAndDocument,
    TextAndMultipleDocuments,
    MultipleDocuments,

    TextAndAudio,
    TextAndMultipleAudio,
    MultipleAudio,

    TextAndUnhadnled,
    TextAndMultipleUnhadnled,
    MultipleUnhadnled,

    TextAndMixed
}

export class Post {

    public type : PostMediaType;

    public from_id: string;
    public date: Date;
    public isAd: boolean;
    public isPinned: boolean;
    public postSource: string;
    public text: string;
    public attachments: PostAttachment[];
    public likeCount: number;
    public repostsCount: number;
    public commentsCount: number;
    
    public constructor(input: any) {
        if (input.hasOwnProperty('from_id'))
            this.from_id = input.from_id;
    
        if (input.hasOwnProperty('date'))
            this.date = new Date(input.date * 1000);
        
        if (input.hasOwnProperty('marked_as_ads'))
            this.isAd = input.marked_as_ads === 1;
        else this.isAd = false;
        
        if (input.hasOwnProperty('text'))
            this.text = input.text;
        
        if (input.hasOwnProperty('is_pinned'))
            this.isPinned = input.is_pinned === 1;
        else this.isPinned = false;
        
        this.attachments = [];
        if (input.hasOwnProperty('attachments')) 
        {
            input.attachments.forEach(attachment => {
                switch (attachment.type) {
                    case 'photo':
                    case 'posted_photo':
                    {
                        this.attachments.push(new PhotoPostAttachment(attachment.photo));
                        break;
                    }
        
                    case 'video':
                    case 'audio':
                    case 'doc':
                    case 'graffiti':
                    case 'url':
                    case 'note':
                    case 'app':
                    case 'poll':
                    case 'page':
                    default:
                    {
                        console.log(`${attachment.type} is unknown =c`);
                        break;
                    }
                }
            });
        }

        if(this.attachments.length == 0) {
            this.type = this.text ? PostMediaType.TextOnly : PostMediaType.Empty;
        } else
        {
            if(this.attachments.length == 1) {

                if(this.attachments[0].type == AttachmentType.Photo || this.attachments[0].type == AttachmentType.Video) {
                    this.type = this.text ? PostMediaType.TextAndPhotoVideo : PostMediaType.PhotoVideoOnly;
                } else if(this.attachments[0].type == AttachmentType.Doc) {
                    this.type = this.text ? PostMediaType.TextAndDocument : PostMediaType.DocumentOnly;
                } else if(this.attachments[0].type == AttachmentType.Audio) {
                    this.type = this.text ? PostMediaType.TextAndAudio : PostMediaType.AudioOnly;
                } else {
                    this.type = this.text ? PostMediaType.TextAndUnhadnled : PostMediaType.Unhandled;
                }
            } else {

                if(this.attachments.every(a => a.type == AttachmentType.Photo || a.type == AttachmentType.Video)) {
                    this.type = this.text ? PostMediaType.TextAndMultiplePhotoVideo : PostMediaType.MultiplePhotoVideo;
                } else if(this.attachments.every(a => a.type == AttachmentType.Doc)) {
                    this.type = this.text ? PostMediaType.TextAndMultipleDocuments : PostMediaType.MultipleDocuments;
                } else if(this.attachments.every(a => a.type == AttachmentType.Audio)) {
                    this.type = this.text ? PostMediaType.TextAndMultipleAudio : PostMediaType.MultipleAudio;
                } else if (
                    this.attachments.every(a => a.type == AttachmentType.Graffiti) ||
                    this.attachments.every(a => a.type == AttachmentType.App) ||
                    this.attachments.every(a => a.type == AttachmentType.Note) ||
                    this.attachments.every(a => a.type == AttachmentType.Page) ||
                    this.attachments.every(a => a.type == AttachmentType.Poll) ||
                    this.attachments.every(a => a.type == AttachmentType.URL)
                ) {
                    this.type = this.text ? PostMediaType.TextAndMultipleUnhadnled : PostMediaType.TextAndMultipleUnhadnled;
                } else {
                    this.type = this.text ? PostMediaType.TextAndMixed : PostMediaType.Mixed;
                }
            }
        }


        
        if (input.hasOwnProperty('likes') && input.likes.hasOwnProperty('count'))
            this.likeCount = Number(input.likes.count);
        
        if (input.hasOwnProperty('reposts') && input.reposts.hasOwnProperty('count'))
            this.repostsCount = Number(input.reposts.count);
        
        if (input.hasOwnProperty('comments') && input.comments.hasOwnProperty('count'))
            this.commentsCount = Number(input.comments.count);
    }
    
    public toDebugJSON(): String {
        return JSON.stringify({
            from_id: this.from_id,
            date: this.date,
            isAd: this.isAd,
            isPinned: this.isPinned,
            postSource: this.postSource,
            text: this.text ? (this.text.length > 50 ? this.text.substring(0, 50) + "..." : this.text) : undefined,
            attachments: this.attachments ? this.attachments.map(p => p.toDebugJSON()) : [],
            likeCount: this.likeCount,
            repostsCount: this.repostsCount,
            commentsCount: this.commentsCount
        });
    }
}