import { user } from "./user";
import { storeUser, getUser } from "./db";
import TelegramBot = require('node-telegram-bot-api');

const MyTelegramBot = new TelegramBot("676086893:AAFPGabadE6_qDJsgKyYcOC8aZRz91pkqxU");
MyTelegramBot.startPolling( {restart: true} );

let IDContainedPublicURL = /(?<=^(https:\/\/)vk\.com\/(club)|(public))\d{4,}$/.compile();
let PublicURL = /^(https:\/\/)?vk\.com\/(.+)$/.compile();
let PublicID = /^\d{4,}$/.compile();

function sendHelpMessage(id : number) {
    MyTelegramBot.sendMessage(
        id, 
        "Бот для автоматического репоста постов с ВэКа вам в телегу. Для начала вам необходимо " +
        "подписаться на паблики, посты с которых вы хотите видеть в боте.\n\n" +
        "🤔Комманды бота🤔\nЮзай:\n\n" +
        "/subscribe [group-id or group-link] - чтобы включить мониторинг указанного паблика\n\n" + 
        "/unsubscribe - чтобы выключить мониторинг паблика\n\n" +
        "/getPosts <optional: group-id or group-link> <optional: posts count> - чтобы получить последние посты паблика\n\n" +
        "/getWall <optional: posts count> - чтобы получить сквозной список постов со всех подписанных пабликов\n\n" + 
        "/help - Чтобы вывести эту хелпу"
    );
}

let Commands = {
    start : "/start",
    subscribe : "/subscribe"
}

MyTelegramBot.onText(new RegExp(Commands.start), (msg, match) => {
    
    let newUser = new user(msg.from.id);
    newUser.registerDate = new Date(Date.now());

    storeUser(newUser);
    sendHelpMessage(msg.from.id);
});

MyTelegramBot.onText(new RegExp(Commands.subscribe), (msg, match) => {
    
    const exampleURL = "https://vk.com/club41670861"
    let u = getUser(msg.from.id);
    let cleanStr = msg.text.replace(Commands.subscribe, "").trim();

    if(cleanStr === "") {
        MyTelegramBot.sendMessage(
            msg.from.id, 
            `Пожалуйста, укажите URL-аддрес паблика или его ID. Например: ${exampleURL}`
        );
        return;
    }

    let fullURIMatch = IDContainedPublicURL.exec(cleanStr);
    if(fullURIMatch != null) {
        console.log(fullURIMatch[0]);
    } else {

        MyTelegramBot.sendMessage(
            msg.from.id, 
            `Введенный URL имел неправильный формат, пожалуйста введите корректый аддре/номер. Например: ${exampleURL}`
        );

    }
    
});

