import { user } from "./user";
import { storeUser, getUser } from "./db";

let u = new user("123", [ "asdasd", "cmask", "asdklas"]);
storeUser(u);

let b = getUser("123");
console.log(`${b}`);

//import TelegramBot = require('node-telegram-bot-api');

/*

const MyTelegramBot = new TelegramBot('');

MyTelegramBot.startPolling( {restart: true} );

MyTelegramBot.onText(/\/start/, (msg, match) => {
    MyTelegramBot.sendMessage(msg.from.id, match[0].toString());
})

*/