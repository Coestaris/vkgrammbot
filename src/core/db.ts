import { user } from "./user";
import db = require('quick.db'); 

let usersTable = new db.table("users");

export function getUser(teleID : string | number) : user {
    let u = new user(teleID.toString());
    return user.parseJSON(teleID.toString(), usersTable.get(teleID.toString()) as string);
}

export function storeUser(user : user) {
    usersTable.set(user.telegramID, user.toJSON());
}