import { listeningType } from "../listeningType";

export class user {
    public constructor(teleID : string | number) {
        this.telegramID = teleID.toString();
        this.vkGroupsIds = [];
        this.vkGroupsNames = [];
        this.getPosts = { count : 0, offset : 0 };

        this.currentListening = listeningType.GenericCommand;
    }
    
    public currentListening : listeningType;
    public registerDate : Date;
    public telegramID : string;
    public vkGroupsIds : string[];
    public vkGroupsNames : string[];

    public getPosts : { count : number, offset : number };

    public static parseJSON(teleID : string, input : string) : user {
        let a = new user(teleID);
        let json = JSON.parse(input);

        a.registerDate = json.registerDate;
        a.vkGroupsIds = json.vkGroupsIds;
        a.vkGroupsNames = json.vkGroupsNames;
        a.currentListening = json.currentListening;
        a.getPosts = json.getPosts;

        return a;
    }

    public toJSON() : string {
        return JSON.stringify({ 
            vkGroupsIds : this.vkGroupsIds,
            vkGroupsNames : this.vkGroupsNames,
            registerDate : this.registerDate,
            currentListening : this.currentListening,
            getPosts : this.getPosts
        });
    }
}