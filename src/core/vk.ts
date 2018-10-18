import VK = require('vksdk');
import { Post } from "../posts/Post";

var vk = new VK({
    'appId'     : 6646136,
    'appSecret' : 'AbDjGwOMf2yZ8jEV1Hes',
    'language'  : 'ru'
});

vk.setSecureRequests(true);
vk.setToken('');

export function getPosts(fromGroup : boolean, id : string, count : number, offset : number, callbackFunc : (posts : Post[]) => void)
{
    vk.request('wall.get', {'owner_id' : (fromGroup ? -1 : 1) * Number(id), 'count' : count, 'offset' : offset }, function(_o) {
        let posts = new Array<Post>();
        
        console.log(JSON.stringify(_o));
        
        _o.response.items.forEach(element => {
            //posts.push(new Post(element));
        });

        callbackFunc(posts);
    });
}

export function getGroupId(name : string, callbackFn : (id : string, fullName : string) => void) : void {

    vk.request('groups.getById', {'group_id' : name, 'fields' : ['name'] }, function(_o) {
        callbackFn(_o.response[0].id.toString(), _o.response[0].name.toString());
    });    
}

export function getGroupName(id : string, callbackFunc : (name : string) => void) : void {
    
    vk.request('groups.getById', {'group_id' : id, 'fields' : ['name'] }, function(_o) {
        callbackFunc(_o.response[0].name.toString());
    });
}