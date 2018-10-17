import { AttachmentType } from "./AttachmentType";
import { PostAttachment } from "./PostAttachment";

export class LinkPostAttachment extends PostAttachment {
    
    public type : AttachmentType;
    public url : string;
    public title : string;

    public constructor(input: any) {
        super();
    
        this.type = AttachmentType.URL;

        if (input.hasOwnProperty('url'))
            this.url = input.url;
    
        if (input.hasOwnProperty('title'))
            this.title = input.title;
    }
    
    public toDebugJSON(): any {
        return {
            type : this.type,
            url : this.url,
            title : this.title
        };
    }
}