export class user {
    public constructor(teleID : string, vkGroups : string[]) {
        this.telegramID = teleID;
        this.vkGroups = vkGroups;
    }
    
    public telegramID : string;
    public vkGroups : string[];
}