import VK = require('vksdk');
import { Post } from "../posts/Post";

var vk = new VK({
    'appId'     : 6646136,
    'appSecret' : 'AbDjGwOMf2yZ8jEV1Hes',
    'language'  : 'ru'
});

vk.setSecureRequests(true);
vk.setToken('0e2db8ca0e2db8ca0e2db8caa90e48d1b200e2d0e2db8ca55701a81eef7af4bcc16930f');

export function getPosts(fromGroup : boolean, id : string, count : number, offset : number, callbackFunc : (posts : Post[]) => void)
{
    vk.request('wall.get', {'owner_id' : (fromGroup ? -1 : 1) * Number(id), 'count' : count, 'offset' : offset }, function(_o) {
        let posts = new Array<Post>();
        _o.response.items.forEach(element => {
            posts.push(new Post(element));
        });

        callbackFunc(posts);
    });
}

export function getGroupName(id : string, callbackFunc : (name : string) => void) : void {
    
    vk.request('groups.getById', {'group_id' : id, 'fields' : ['name'] }, function(_o) {
        callbackFunc(_o.response[0].name);
    });
}