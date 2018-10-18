import { user } from "./user";
import * as db from 'quick.db'; 

let usersTable = new db.table("users");
let timeTable = new db.table("time");

export function getUser(teleID : string | number) : user {
    let u = new user(teleID.toString());
    return user.parseJSON(teleID.toString(), usersTable.get(teleID.toString()) as string);
}

export function storeUser(user : user) {
    usersTable.set(user.telegramID, user.toJSON());
}

export function getAllUsers() : user[] {
    let all = usersTable.fetchAll();
    let users : user[] = [];
    
    all.forEach(element => {
        users.push(getUser(element.ID));
    });

    return users;
}

export function storeTime(time : number) : void {
    timeTable.set("time", time);
}

export function getTime() : number {
    return (Number)(timeTable.get("time"));
}