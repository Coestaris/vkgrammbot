import * as TelegramBot from 'node-telegram-bot-api';
import * as vk from "./core/vk";
import * as Promise from 'bluebird';

import { Post, PostMediaType } from "./posts/Post";
import { user } from "./core/user";
import { listeningType } from "./listeningType";
import { storeUser, getUser } from "./core/db";
import { PhotoPostAttachment } from "./posts/PhotoPostAttachment";

const exampleURL = "https://vk.com/club41670861"
let IDContainedPublicURL = /(?<=https:\/\/vk\.com\/((club)|(public)))\d{4,}$/gm;
let PublicURL = /(?<=(https:\/\/)?vk\.com\/)(.+)$/gm;
let PublicID = /^\d{4,}$/;
let currentListening : listeningType = listeningType.GenericCommand;

const MyTelegramBot = new TelegramBot("676086893:AAFPGabadE6_qDJsgKyYcOC8aZRz91pkqxU");
MyTelegramBot.startPolling( {restart: true} );

function sendPostMessage(id : number, post : Post, groupName : string, groupId : string, callbackFn : () => void) {
    
    let message = `${groupName} (ID: ${groupId})\n${post.date.toUTCString()}\n❤️ ${post.likeCount} | 💬 ${post.commentsCount} | 📢 ${post.repostsCount}`; 

    if(post.text) {
        message += `\n\n${post.text}`;
    }

    if(post.type == PostMediaType.TextAndPhotoVideo || post.type == PostMediaType.PhotoVideoOnly) {

        MyTelegramBot.sendPhoto(id, (post.attachments[0] as PhotoPostAttachment).getOptimalSizeUrl(), 
        {
            caption : message, 
        }).then(callbackFn);

    } else if(post.type == PostMediaType.MultiplePhotoVideo || post.type == PostMediaType.TextAndMultiplePhotoVideo) {

        let group = [];
        message += '\n\n============='
        for(let i = 0; i < post.attachments.length; i++) {
            let photo = (post.attachments[i] as PhotoPostAttachment);
            group.push( { type : "photo", media : photo.getOptimalSizeUrl() } )
            message += `\n[Attachment:Photo ${photo.width}x${photo.height}]`;

        } 

        MyTelegramBot.sendMessage(id, message).then(m => {
            MyTelegramBot.sendMediaGroup(id, group, {
                reply_to_message_id : m.message_id
            }).then(callbackFn);
        });

    }

}

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
    getPosts : "/getPosts",
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
        let msge = "Вы мониторите следующие группы:\n";
        for(let i = 0; i < u.vkGroupsIds.length; i++) {
            msge += `-"*${u.vkGroupsNames[i]}*" (ID: ${u.vkGroupsIds[i]})\n`
        }

        MyTelegramBot.sendMessage(msg.from.id, msge, {
            parse_mode : "Markdown"
        });
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

    vk.getGroupName(id, (name) => {

        if(!name) {
            MyTelegramBot.sendMessage(
                msg.from.id, 
                `⛔️Не было найдено указанной группы в ВК.`
            );
            return;
        }

        MyTelegramBot.sendMessage(
            msg.from.id,
            `✅Группа "*${name}*" (ID: ${id}) была добавлена в список ваших групп!`,
            {
                parse_mode : "Markdown"
            }
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
        keyboard.push([`${u.vkGroupsIds[i]} - "${u.vkGroupsNames[i]}"`]);
    }

    MyTelegramBot.sendMessage(msg.from.id, "Выберите, от какой группы вы желаете отписаться", 
        {
            reply_markup : {
                resize_keyboard : true,
                one_time_keyboard : true,
                keyboard : keyboard
            }
        }
    );

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
                {
                    reply_markup : 
                    {
                        keyboard : []
                    }
                }
            );
            return;
        }

        let name = u.vkGroupsNames[index];

        u.vkGroupsIds.splice(index, 1);
        u.vkGroupsNames.splice(index, 1);

        storeUser(u);

        MyTelegramBot.sendMessage(
            msg.from.id,
            `✅Группа "*${name}*" (ID: ${id}) была удалена со списка ваших групп!`,
            {
                reply_markup : {
                    keyboard : []
                },
                parse_mode : "Markdown"
            }
        );
    
        currentListening = listeningType.GenericCommand;
    }
});

MyTelegramBot.onText(new RegExp(Commands.getPosts), (msg, match) => {
    if(currentListening != listeningType.GenericCommand) {
        currentListening = listeningType.GenericCommand;
    }

    let u = getUser(msg.from.id);

    console.log("call");

    vk.getPosts(true, u.vkGroupsIds[0], 5, 0, (posts) => {
        sendPosts(posts, 0, u.vkGroupsNames[0], u.vkGroupsIds[0], msg.from.id);
    })
});

function sendPosts(posts : Post[], i : number, name : string, grId : string, teleId : number) {
    sendPostMessage(teleId, posts[i], name, grId, () => { 
        if(i != posts.length - 1) sendPosts(posts, i + 1, name, grId, teleId); 
    });
}

function forEachPromise(items, fn) {
    return items.reduce(function (promise, item) {
        return promise.then(function () {
            return fn(item);
        });
    }, Promise.resolve());
}