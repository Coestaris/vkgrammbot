export class user {
    public constructor(teleID : string | number) {
        this.telegramID = teleID.toString();
        this.vkGroups = [];
    }
    
    public registerDate : Date;
    public telegramID : string;
    public vkGroups : string[];

    public static parseJSON(teleID : string, input : string) : user {
        let a = new user(teleID);
        let json = JSON.parse(input);

        a.registerDate = json.registerDate;
        a.vkGroups = json.vkGroups;

        return a;
    }

    public toJSON() : string {
        return JSON.stringify({ 
            vkGroups : this.vkGroups,
            registerDate : this.registerDate
        });
    }
}