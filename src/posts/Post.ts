import { PhotoPostAttachment } from "./PhotoPostAttachment";
import { PostAttachment } from "./PostAttachment";

export class Post {
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
        
        if (input.hasOwnProperty('attachments')) 
        {
            this.attachments = [];
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