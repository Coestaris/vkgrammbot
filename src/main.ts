import * as TelegramBot from 'node-telegram-bot-api';
import * as vk from "./core/vk";
import * as Promise from 'bluebird';

import { Post, PostMediaType } from "./posts/Post";
import { user } from "./core/user";
import { listeningType } from "./listeningType";
import { storeUser, getUser, getAllUsers, storeTime, getTime } from "./core/db";
import { PhotoPostAttachment } from "./posts/PhotoPostAttachment";
import { AttachmentType } from './posts/AttachmentType';
import { PostAttachment } from './posts/PostAttachment';
import { LinkPostAttachment } from './posts/LinkPostAttachment';

const exampleURL = "https://vk.com/club41670861"
let IDContainedPublicURL = /(?<=https:\/\/vk\.com\/((club)|(public)))\d{4,}$/gm;
let PublicURL = /(?<=(https:\/\/)?vk\.com\/)(.+)$/gm;
let PublicID = /^\d{4,}$/;

const tgBot = new TelegramBot("");
tgBot.startPolling( {restart: true} );

function getMediaGroup(attachments : PostAttachment[]) : TelegramBot.InputMedia[] {

    let group = new Array<TelegramBot.InputMedia>();

    attachments.forEach(j => {
        if(j.type == AttachmentType.Photo) {
            let photo = j as PhotoPostAttachment;
            group.push( { type : "photo", media : photo.getOptimalSizeUrl() } );

        } else if(j.type == AttachmentType.Video) {

        } else {
            //TODO
        }
    });
    
    return group;
}

function sendPostMessage(id : number, post : Post, groupName : string, groupId : string, callbackFn : () => void) {

    if(post.type == PostMediaType.Empty) {
        return;
    }
    
    let message = `Posted by *${groupName}* (ID: ${groupId})\nat _${post.date.toUTCString()}_.\n❤️ ${post.likeCount} | 💬 ${post.commentsCount} | 📢 ${post.repostsCount}`; 

    if(post.text) {
        message += `\n\n${post.escapeText()}`;
    }

    if(post.type == PostMediaType.TextOnly) {

        tgBot.sendMessage(id, message, {
            parse_mode : "Markdown",
            reply_markup : {
                remove_keyboard : true
            }
        }).then(callbackFn);


    } else if(post.type == PostMediaType.TextAndPhotoVideo || post.type == PostMediaType.PhotoVideoOnly) {

        let url = (post.attachments[0] as PhotoPostAttachment).getOptimalSizeUrl();

        tgBot.sendPhoto(id, url).then((m) =>
            tgBot.sendMessage(id, message, {
                reply_to_message_id : m.message_id,
                parse_mode : "Markdown",
                reply_markup : {
                    force_reply : true,
                    remove_keyboard : true
                }
        }).then(callbackFn));

    } else if(post.type == PostMediaType.MultiplePhotoVideo || post.type == PostMediaType.TextAndMultiplePhotoVideo) {

        let group = getMediaGroup(post.attachments);
        message += '\n\n============='

        post.attachments.forEach(element => {
            if(element.type == AttachmentType.Photo) {
                let photo = element as PhotoPostAttachment;
                message += `\n\\[Attachment: photo(${photo.width} x ${photo.height})\\]`;
            } else {

            }
        });

        tgBot.sendMediaGroup(id, group).then((m) => 
            tgBot.sendMessage(id, message, {
                reply_to_message_id : m.message_id,
                parse_mode : "Markdown",
                reply_markup : {
                    force_reply : true,
                    remove_keyboard : true
                }
            }
            ).then(callbackFn));
    } else if(post.type == PostMediaType.Mixed || post.type == PostMediaType.TextAndMixed) {

        if(post.attachments.some(p => p.type == AttachmentType.URL))
        {
            message += '\n\n============='
            message += "\nPost links: "
            post.attachments.filter(p => p.type == AttachmentType.URL).forEach(p => {
                console.log(JSON.stringify(p.toDebugJSON()));
                
                message += `\n-[${(p as LinkPostAttachment).title}](${(p as LinkPostAttachment).url})`;
            });
        }

        let videoPhoto = post.attachments.filter(p => p.type == AttachmentType.Video || p.type == AttachmentType.Photo);
        let group;
        
        if(videoPhoto.length != 0) {
            group = getMediaGroup(videoPhoto);
        }

        videoPhoto.forEach(p => {
            if(p.type == AttachmentType.Photo) {
                let photo = p as PhotoPostAttachment;
                message += `\n\\[Attachment: photo(${photo.width} x ${photo.height})\\]`;
            } else {
                
            }
        })

        tgBot.sendMediaGroup(id, group).then((m) => 
            tgBot.sendMessage(id, message, {
                reply_to_message_id : m.message_id,
                parse_mode : "Markdown",
                reply_markup : {
                    force_reply : true,
                    remove_keyboard : true
                }
            }).then(callbackFn));
    }
}

function sendHelpMessage(id : number) {
    tgBot.sendMessage(
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

tgBot.onText(new RegExp(Commands.getList), (msg, match) => {

    let u = getUser(msg.from.id);
    if(u.currentListening != listeningType.GenericCommand) {
        u.currentListening = listeningType.GenericCommand;
    }

    if(u.vkGroupsIds.length == 0) {
        tgBot.sendMessage(msg.from.id, `Cписок пуст`);
    } else { 
        let msge = "Вы мониторите следующие группы:\n";
        for(let i = 0; i < u.vkGroupsIds.length; i++) {
            msge += `-"*${u.vkGroupsNames[i]}*" (ID: ${u.vkGroupsIds[i]})\n`
        }

        tgBot.sendMessage(msg.from.id, msge, {
            parse_mode : "Markdown"
        });
    }
});

tgBot.onText(new RegExp(Commands.help), (msg, match) => {
    
    let u = getUser(msg.from.id);
    if(u.currentListening != listeningType.GenericCommand) {
        u.currentListening = listeningType.GenericCommand;
    }

    sendHelpMessage(msg.from.id);
});

tgBot.onText(new RegExp(Commands.start), (msg, match) => {

    let newUser = new user(msg.from.id);
    newUser.registerDate = new Date(Date.now());
    storeUser(newUser);
    sendHelpMessage(msg.from.id);
});

tgBot.onText(new RegExp(Commands.subscribe), (msg, match) => {

    let u = getUser(msg.from.id);
    if(u.currentListening != listeningType.GenericCommand) {
        u.currentListening = listeningType.GenericCommand;
    }

    let cleanStr = msg.text.replace(Commands.subscribe, "").trim();
    if(cleanStr === "") {
        tgBot.sendMessage(
            msg.from.id, 
            `⛔️Пожалуйста, укажите URL-аддрес паблика или его ID. Например: ${exampleURL}`
        );
        return;
    }
    let ident : string = "";

    let fullURIMatch = cleanStr.match(IDContainedPublicURL);
    if(fullURIMatch) {
        ident = fullURIMatch.toString();
    } else {

        let URIMatch = cleanStr.match(PublicURL);
        if(URIMatch) 
        {
            ident = URIMatch.toString();
        } 
        else if(cleanStr.match(PublicID)) 
        {
            ident = cleanStr;
        }
        else 
        {
            tgBot.sendMessage(
                msg.from.id, 
                `⛔️Введенный URL имел неправильный формат, пожалуйста введите корректый аддрес/номер. Например: ${exampleURL}`
            );
            return;
        }
    }

    vk.getGroupId(ident, (id, name) => {

        if(!name) {
            tgBot.sendMessage(
                msg.from.id, 
                `⛔️Не было найдено указанной группы в ВК.`
            );
            return;
        }

        if(u.vkGroupsIds.indexOf(id) != -1) {
            tgBot.sendMessage(
                msg.from.id, 
                `⛔️Вы уже мониторите данную группу`
            );
            return;
        }

        tgBot.sendMessage(
            msg.from.id,
            `✅Группа "*${name}*" (ID: ${id}) была добавлена в список ваших групп!`,
            {
                parse_mode : "Markdown"
            }
        );

        u.vkGroupsIds.push(id.toLowerCase().trim());
        u.vkGroupsNames.push(name);

        storeUser(u);
    });
});

tgBot.onText(new RegExp(Commands.unsubscribe), (msg, match) => {

    let u = getUser(msg.from.id);
    if(u.currentListening != listeningType.GenericCommand) {
        u.currentListening = listeningType.GenericCommand;
    }

    if(u.vkGroupsIds.length == 0) {
        tgBot.sendMessage(
            msg.from.id, 
            `⛔️Вы не мониторите в данный момент ни одной группы`
        );
        return;
    }

    let keyboard = [[]];
    for(let i = 0; i < u.vkGroupsIds.length; i++) {
        keyboard.push([`${u.vkGroupsIds[i]} - "${u.vkGroupsNames[i]}"`]);
    }

    tgBot.sendMessage(msg.from.id, "Выберите, от какой группы вы желаете отписаться", 
        {
            reply_markup : {
                resize_keyboard : true,
                one_time_keyboard : true,
                keyboard : keyboard
            }
        }
    );

    u.currentListening = listeningType.GroupToUnsubscribe;
    storeUser(u);
});

tgBot.onText(/^\d{4,} - .+$/, (msg, match) => {

    let u = getUser(msg.from.id);
    if(u.currentListening == listeningType.GroupToUnsubscribe) {

        let id : string = msg.text.split('-')[0].trim();
        let index = u.vkGroupsIds.indexOf(id);

        if(index == -1) {
            tgBot.sendMessage(
                msg.from.id, 
                `⛔️Группа с данным ID не числится в ваших группах`,
                {
                    reply_markup : 
                    {
                        remove_keyboard : true
                    }
                }
            );
            return;
        }

        let name = u.vkGroupsNames[index];

        u.vkGroupsIds.splice(index, 1);
        u.vkGroupsNames.splice(index, 1);
        u.currentListening = listeningType.GenericCommand;

        storeUser(u);

        tgBot.sendMessage(
            msg.from.id,
            `✅Группа "*${name}*" (ID: ${id}) была удалена со списка ваших групп!`,
            {
                reply_markup : {
                    remove_keyboard : true
                },
                parse_mode : "Markdown"
            }
        );
    
    } else if(u.currentListening == listeningType.GroupToGetPosts) {

        let id : string = msg.text.split('-')[0].trim();

        console.log(u.vkGroupsIds); 
        console.log(id);

        let index = u.vkGroupsIds.indexOf(id);

        if(index == -1) {
            tgBot.sendMessage(
                msg.from.id, 
                `⛔️Группа с данным ID (${id}) не числится в ваших группах`,
                {
                    reply_markup : 
                    {
                        remove_keyboard : true
                    }
                }
            );
            return;
        }

        let name = u.vkGroupsNames[index];

        u.currentListening = listeningType.GenericCommand;
        storeUser(u);

        vk.getPosts(true, id, u.getPosts.count, u.getPosts.offset, (posts) => {
            sendPosts(posts, 0, name, id, msg.from.id);
        })

    }
});

tgBot.onText(new RegExp("/tick"), (msg, match) => {
    tick();
});

tgBot.onText(new RegExp(Commands.getPosts), (msg, match) => {
    
    let u = getUser(msg.from.id);
    if(u.currentListening != listeningType.GenericCommand) {
        u.currentListening = listeningType.GenericCommand;
    }

    let cleanStr = msg.text.replace(Commands.getPosts, "").trim();

    let parts = cleanStr.split(' ');
    
    if(parts.length != 0) {
        u.getPosts.count = Number(parts[0]);
        if(parts.length == 2) u.getPosts.offset = Number(parts[1]);
        else u.getPosts.offset = 0;
    } else {
        u.getPosts.count = 5;
        u.getPosts.offset = 0;
    }

    let keyboard = [[]];
    for(let i = 0; i < u.vkGroupsIds.length; i++) {
        keyboard.push([`${u.vkGroupsIds[i]} - "${u.vkGroupsNames[i]}"`]);
    }

    tgBot.sendMessage(msg.from.id, `Выберите, откуда желаете получить ${u.getPosts.count} постов`, 
        {
            reply_markup : {
                resize_keyboard : true,
                one_time_keyboard : true,
                keyboard : keyboard
            }
        }
    );

    u.currentListening = listeningType.GroupToGetPosts;
    storeUser(u);
});

function sendPosts(posts : Post[], i : number, name : string, grId : string, teleId : number) {
    sendPostMessage(teleId, posts[i], name, grId, () => { 
        if(i != posts.length - 1) sendPosts(posts, i + 1, name, grId, teleId); 
    });
}

function getUTCNow()
{
    var now = new Date();
    var time = now.getTime();
    var offset = now.getTimezoneOffset();
    offset = offset * 60000;
    return time - offset;
}

let lastUpdateTime = getTime();
let currentTime = lastUpdateTime;

setInterval(() => {
    console.log("Tick");
    tick();
}, 60000);

function tick() {

    lastUpdateTime = currentTime;
    currentTime = getUTCNow();
    storeTime(lastUpdateTime);

    let users = getAllUsers();
    users.forEach(user => {
        console.log(`Proceed user: ${user.telegramID}`);
        
        user.vkGroupsIds.forEach((group, index) => {
            vk.getPosts(true, group, 10, 0, (posts) => {
                
                
                let postsToSend : Post[] = [];
                
                posts.forEach(post => {
                    if(post.date.getTime() >= lastUpdateTime)
                        postsToSend.push(post);
                });

                console.log(`Proceed group: ${group}. Posts count: ${posts.length}. Posts to send: ${postsToSend.length}`);
                
                if(postsToSend.length != 0) 
                    sendPosts(postsToSend, 0, user.vkGroupsNames[index], group, Number(user.telegramID));
            });
        });
    })
}