import { user } from "./user";
import { listeningType } from "./listeningType";
import { storeUser, getUser } from "./db";
//import { getGroupName } from "./vk"

import TelegramBot = require('node-telegram-bot-api');

const exampleURL = "https://vk.com/club41670861"
let IDContainedPublicURL = /(?<=https:\/\/vk\.com\/((club)|(public)))\d{4,}$/gm;
let PublicURL = /(?<=(https:\/\/)?vk\.com\/)(.+)$/gm;
let PublicID = /^\d{4,}$/;
let currentListening : listeningType = listeningType.GenericCommand;

const MyTelegramBot = new TelegramBot("676086893:AAFPGabadE6_qDJsgKyYcOC8aZRz91pkqxU");

import VK = require('vksdk');

var vk = new VK({
    'appId'     : 6646136,
    'appSecret' : 'AbDjGwOMf2yZ8jEV1Hes',
    'language'  : 'ru'
});

vk.setSecureRequests(true);
vk.setToken('0e2db8ca0e2db8ca0e2db8caa90e48d1b200e2d0e2db8ca55701a81eef7af4bcc16930f');

function getGroupName(id : string, callBack : (name : string) => void) : void {
    
    vk.request('groups.getById', {'group_id' : id, 'fields' : ['name'] }, function(_o) {
        callBack(_o.response[0].name);
    });
}


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
    help : "/help",
    start : "/start",
    subscribe : "/subscribe",
    unsubscribe : "/unsubscribe"
}

MyTelegramBot.onText(new RegExp(Commands.getList), (msg, match) => {

    if(currentListening != listeningType.GenericCommand) {
        currentListening = listeningType.GenericCommand;
    }

    let u = getUser(msg.from.id);
    if(u.vkGroupsIds.length == 0) {
        MyTelegramBot.sendMessage(msg.from.id, `Cписок пуст`);
    } else { 
        let msge = "Вы мониторите следующие группы:";
        for(let i = 0; i < u.vkGroupsIds.length; i++) {
            msge += `"${u.vkGroupsNames[i]}" (ID: ${u.vkGroupsIds[i]})\n`
        }

        MyTelegramBot.sendMessage(msg.from.id, msge);
    }
});

MyTelegramBot.onText(new RegExp(Commands.help), (msg, match) => {
    
    if(currentListening != listeningType.GenericCommand) {
        currentListening = listeningType.GenericCommand;
    }

    sendHelpMessage(msg.from.id);
});

MyTelegramBot.onText(new RegExp(Commands.start), (msg, match) => {
    
    if(currentListening != listeningType.GenericCommand) {
        currentListening = listeningType.GenericCommand;
    }
    
    let newUser = new user(msg.from.id);
    newUser.registerDate = new Date(Date.now());
    storeUser(newUser);
    sendHelpMessage(msg.from.id);
});

MyTelegramBot.onText(new RegExp(Commands.subscribe), (msg, match) => {

    if(currentListening != listeningType.GenericCommand) {
        currentListening = listeningType.GenericCommand;
    }

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
    if(u.vkGroupsIds.indexOf(id) != -1) {
        MyTelegramBot.sendMessage(
            msg.from.id, 
            `⛔️Вы уже мониторите данную группу`
        );
        return;
    }

    getGroupName(id, (name) => {

        MyTelegramBot.sendMessage(
            msg.from.id,
            `✅Группа "${name}" (ID: ${id}) была добавлена в список ваших групп!` 
        );

        u.vkGroupsIds.push(id);
        u.vkGroupsNames.push(name);

        storeUser(u);
    });
});

MyTelegramBot.onText(new RegExp(Commands.unsubscribe), (msg, match) => {

    if(currentListening != listeningType.GenericCommand) {
        currentListening = listeningType.GenericCommand;
    }

    let u = getUser(msg.from.id);

    if(u.vkGroupsIds.length == 0) {
        MyTelegramBot.sendMessage(
            msg.from.id, 
            `⛔️Вы не мониторите в данный момент ни одной группы`
        );
        return;
    }

    let keyboard = [[]];

    for(let i = 0; i < u.vkGroupsIds.length; i++) {
        keyboard.push([`${u.vkGroupsIds[i]} - ${u.vkGroupsNames[i]}}`]);
    }

    MyTelegramBot.sendMessage(msg.from.id, "Выберите, от какой группы вы желаете отписаться", 
    ({
        reply_markup : {
            resize_keyboard : true,
            one_time_keyboard : true,
            keyboard : keyboard
    }}) as unknown as TelegramBot.SendMessageOptions);

    currentListening = listeningType.GroupToUnsubscribe;
});

MyTelegramBot.onText(/^\d{4,} - .+$/, (msg, match) => {
    
    if(currentListening == listeningType.GroupToUnsubscribe) {

        let id : string = msg.text.split('-')[0].trim();
        let u =  getUser(msg.from.id);

        let index = u.vkGroupsIds.indexOf(id);

        if(index == -1) {
            MyTelegramBot.sendMessage(
                msg.from.id, 
                `⛔️Группа с данным ID не числится в ваших группах`,
                ({
                    reply_markup : {
                        keyboard : []
                }}) as unknown as TelegramBot.SendMessageOptions
            );
            return;
        }

        let name = u.vkGroupsNames[index];

        u.vkGroupsIds.splice(index, 1);
        u.vkGroupsNames.splice(index, 1);

        storeUser(u);

        MyTelegramBot.sendMessage(
            msg.from.id,
            `✅Группа "${name}" (ID: ${id}) была удалена со списка ваших групп!`,
            ({
                reply_markup : {
                    keyboard : []
            }}) as unknown as TelegramBot.SendMessageOptions
        );
    
        currentListening = listeningType.GenericCommand;
    }
});