import { AttachmentType } from "./AttachmentType";
import { PostAttachment } from "./PostAttachment";

export class PhotoPostAttachment extends PostAttachment {
    public id: number;
    public album_id: number;
    public width: number;
    public height: number;
    public sizes: {
        name: string;
        url: string;
    }[];
    
    public getOptimalSizeUrl() : string {
        //TODO:!
        return this.sizes[this.sizes.length - 1].url;
    }

    public constructor(input: any) {
        super();
    
        this.id = input.id;
        if (input.hasOwnProperty('album_id'))
            this.album_id = input.album_id;
    
        this.width = input.width;
        this.height = input.height;
    
        this.sizes = [];
        if (input.hasOwnProperty('photo_75'))
            this.sizes.push({ name: '75', url: input.photo_75 });
    
        if (input.hasOwnProperty('photo_130'))
            this.sizes.push({ name: '130', url: input.photo_130 });
    
        if (input.hasOwnProperty('photo_604'))
            this.sizes.push({ name: '604', url: input.photo_604 });
    
        if (input.hasOwnProperty('photo_807'))
            this.sizes.push({ name: '807', url: input.photo_807 });
    
        if (input.hasOwnProperty('photo_1280'))
            this.sizes.push({ name: '1280', url: input.photo_1280 });
    
        if (input.hasOwnProperty('photo_2560'))
            this.sizes.push({ name: '2560', url: input.photo_2560 });
    
        this.type = AttachmentType.Photo;
    }
    
    public toDebugJSON(): any {
        return {
            type : this.type,
            id: this.id,
            album_id: this.album_id,
            width: this.width,
            height: this.height,
            sizes: this.sizes
        };
    }
}