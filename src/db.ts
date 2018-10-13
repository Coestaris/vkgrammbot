import { user } from "./user";
import db = require('quick.db'); 

let usersTable = new db.table("users");

export function getUser(teleID : string) : user {
    return new user(
        teleID,
        (usersTable.get(teleID) as string[])
    );
}

export function storeUser(user : user) {
    usersTable.set(user.telegramID, user.vkGroups);
}