import { user } from "./user";
import { storeUser, getUser } from "./db";
import TelegramBot = require('node-telegram-bot-api');

const exampleURL = "https://vk.com/club41670861"
let IDContainedPublicURL = /(?<=https:\/\/vk\.com\/((club)|(public)))\d{4,}$/gm;
let PublicURL = /(?<=(https:\/\/)?vk\.com\/)(.+)$/gm.compile();
let PublicID = /^\d{4,}$/.compile();

const MyTelegramBot = new TelegramBot("676086893:AAFPGabadE6_qDJsgKyYcOC8aZRz91pkqxU");
MyTelegramBot.startPolling( {restart: true} );

function sendHelpMessage(id : number) {
    MyTelegramBot.sendMessage(
        id, 
        "Бот для автоматического репоста постов с ВэКа вам в телегу. Для начала вам необходимо " +
        "подписаться на паблики, посты с которых вы хотите видеть в боте.\n\n" +
        "🤔Комманды бота🤔\nЮзай:\n\n" +
        "/subscribe [group-id or group-link] - чтобы включить мониторинг указанного паблика\n\n" + 
        "/getGroups - чтобы получить список всех прослушиваеммых пабликов\n\n" +
        "/unsubscribe - чтобы выключить мониторинг паблика\n\n" +
        "/getPosts <optional: group-id or group-link> <optional: posts count> - чтобы получить последние посты паблика\n\n" +
        "/getWall <optional: posts count> - чтобы получить сквозной список постов со всех подписанных пабликов\n\n" + 
        "/help - Чтобы вывести эту хелпу"
    );
}

let Commands = {
    getList : "/getGroups",
    start : "/start",
    subscribe : "/subscribe"
}

MyTelegramBot.onText(new RegExp(Commands.getList), (msg, match) => {
    let u = getUser(msg.from.id);

    if(u.vkGroups.length == 0) {

        MyTelegramBot.sendMessage(msg.from.id, `Cписок пуст`);

    } else { 
        MyTelegramBot.sendMessage(msg.from.id, `Вы мониторите следующие группы:\n -${u.vkGroups.join("\n -")}`);
    }
});

MyTelegramBot.onText(new RegExp(Commands.start), (msg, match) => {
    
    let newUser = new user(msg.from.id);
    newUser.registerDate = new Date(Date.now());
    storeUser(newUser);
    sendHelpMessage(msg.from.id);
});

MyTelegramBot.onText(new RegExp(Commands.subscribe), (msg, match) => {

    let u = getUser(msg.from.id);
    let cleanStr = msg.text.replace(Commands.subscribe, "").trim();
    if(cleanStr === "") {
        MyTelegramBot.sendMessage(
            msg.from.id, 
            `⛔️Пожалуйста, укажите URL-аддрес паблика или его ID. Например: ${exampleURL}`
        );
        return;
    }
    let id : string = "";

    let fullURIMatch = cleanStr.match(IDContainedPublicURL);
    if(fullURIMatch) {
        id = fullURIMatch.toString();
    } else {

        let URIMatch = cleanStr.match(PublicURL);
        if(URIMatch) 
        {
            id = URIMatch.toString();
        } 
        else if(cleanStr.match(PublicID)) 
        {
            id = cleanStr;
        }
        else 
        {
            MyTelegramBot.sendMessage(
                msg.from.id, 
                `⛔️Введенный URL имел неправильный формат, пожалуйста введите корректый аддрес/номер. Например: ${exampleURL}`
            );
            return;
        }
    }
    
    if(u.vkGroups.indexOf(id) != -1) {
        MyTelegramBot.sendMessage(
            msg.from.id, 
            `⛔️Вы уже мониторите данную группу`
        );
        return;
    }

    MyTelegramBot.sendMessage(
        msg.from.id,
        `✅Группа с айди ${id} была добавлена в список ваших групп!` 
    );
    u.vkGroups.push(id);
    storeUser(u);
});

