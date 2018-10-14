export class user {
    public constructor(teleID : string | number) {
        this.telegramID = teleID.toString();
        this.vkGroupsIds = [];
        this.vkGroupsNames = [];
    }
    
    public registerDate : Date;
    public telegramID : string;
    public vkGroupsIds : string[];
    public vkGroupsNames : string[];

    public static parseJSON(teleID : string, input : string) : user {
        let a = new user(teleID);
        let json = JSON.parse(input);

        a.registerDate = json.registerDate;
        a.vkGroupsIds = json.vkGroupsIds;
        a.vkGroupsNames = json.vkGroupsNames;

        return a;
    }

    public toJSON() : string {
        return JSON.stringify({ 
            vkGroupsIds : this.vkGroupsIds,
            vkGroupsNames : this.vkGroupsNames,
            registerDate : this.registerDate
        });
    }
}