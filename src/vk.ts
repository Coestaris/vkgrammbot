/*
export function getGroupName(id : string) {
    
    console.log(`getGgoupName call: ${id}`);
    
    let name = "";
    vk.request('groups.getById', {'group_id' : Number(id), 'fields' : ['name'] }, function(_o) {
        
        console.log(JSON.stringify(_o));
        name = _o.response[0].name;
    });

    return name;
}*/