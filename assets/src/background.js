var client = ZAFClient.init();

client.on('ticket.saved', function(data) {
    // checkTicketUpdation(data.ticket);
});


/*
function checkTicketUpdation(savedTicket){
    var ticketId = savedTicket.id;
    var ticketTags = savedTicket.tags;
    var getAgentDetail = {
        url: '/api/v2/users/',
        type: 'GET',
        dataType: 'json'
    }

    client.get('currentUser').then(function(data){
        
        var agentId = data['currentUser'].id;

        getAgentDetail.url = '/api/v2/users/'+agentId+'.json'

        client.request(getAgentDetail).then(function(data){
            var userSetting = data.user.user_fields.agent_activity_setting;
            var userTag = data.user.user_fields.agent_activity_tag;

            var getAudits = {
                url:'/api/v2/tickets/'+ticketId+'/audits.json',
                type:'GET',
                dataType:'json'
            };

            client.request(getAudits).then(function(data){
                
                if(data.count>100){
                    var lastPage = Math.ceil(data.count / 100);
                    
                    getAudits.url = '/api/v2/tickets/'+ticketId+'/audits.json?page='+lastPage;

                    client.request(getAudits).then(function(data){
                        var audit = data.audits[data.audits.length-1];
                        saveTicketSetting(audit,ticketId,ticketTags,userSetting,userTag);
                    });
                    
                }else{
                    var audit = data.audits[data.audits.length-1];
                    saveTicketSetting(audit,ticketId,ticketTags,userSetting,userTag);
                }
            });

        });

    });
    
}

function saveTicketSetting(audit,ticketId,tags,userSetting,userTag){
    var needToUpdate = false;
    
    if(userSetting=='any_updates'){
        needToUpdate = true;
    }else if(userSetting=='updates_with_any_comments'){
        if(checkCommentType(audit.events)!=false){
            needToUpdate = true;
        }
    }else if(userSetting=='updates_with_public_comments'){
        if(checkCommentType(audit.events)=='public'){
            needToUpdate = true;
        }
    }else{
        //Do nothing
    }
    
    if(needToUpdate===true){
        tags.push(userTag);
        var saveTicket = {
            url: '/api/v2/tickets/'+ticketId+'.json',
            type:'PUT',
            dataType:'JSON',
            data:{"ticket":{"tags":tags}}
        }

        client.request(saveTicket).then(function(data){
            console.log(data);
        });
        //client.invoke('ticket.tags.add', userTag)
    }
}

function checkCommentType(events){
    var output = false;
    events.forEach((event,key) => {
        if(event.type=='Comment' && event.public==false){
            output = 'private';
            return output;
        }
        if(event.type=='Comment' && event.public==true){
            output = 'public';
            return output;
        }
    });

    return output;
}
*/
