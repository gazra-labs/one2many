var client = ZAFClient.init();

// client.on('app.registered', function appRegistered(e) {

// });

var startingPoint = StartInit();


function StartInit(){
    new Vue({
        el: '#one2many-app',
        data: {
            message: '',
            isSolved: false,
            global_setting:'',
            tickets:[],
            problemDetail:{},
            requests:{
                
            }
        },
        mounted(){
            var instance = this;
            instance.ticketType();
            client.on('ticket.save', function() {
                if (!instance.isSolved) {
                    return 'All child tickets are not solved';
                }
                return instance.isSolved;
            });
        },
        methods:{
            ticketType: function(){
                var instance = this;
                client.get(['ticket.type', 'ticket.id', 'ticket.customField:problem_id']).then(function (data) {
                    if (data['ticket.type'] == 'problem') {
                        instance.listIncidents(data['ticket.id']);
                    } else if (data['ticket.type'] == 'incident') {
                        instance.getProblem(data['ticket.customField:problem_id']);
                    }
                });
            },
            listIncidents: function(ticketId){
                var instance = this;
                client.request({
                    url: '/api/v2/tickets/' + ticketId + '/incidents.json',
                    type: 'GET',
                    dataType: 'json'
                }).then((response) => {
                    instance.tickets = response.tickets;
                    var count = 0;
                    response.tickets.forEach(element => {
                        if (element.status === 'solved' || element.status === 'closed') {
                            count++;
                        }
                    });

                    if(count === instance.tickets.length){
                        instance.isSolved = true;
                    }
                })
            },
            getProblem: function(ticketId){                
                var instance = this;
                client.request({
                    url: '/api/v2/tickets/' + ticketId + '.json',
                    type: 'GET',
                    dataType: 'json'
                }).then((response) => {
                    instance.problemDetail = response.ticket;
                })
            },
            updateAgent: function(agent_id,agent_name, agent_key){
                var instance = this;
                var default_tag = agent_name.replace(/[ |\"|&|\']/g,"_").toLowerCase() + '_tag';
                console.log(agent_id,agent_name);
                var update_array = {
                    user_fields: {
                        agent_activity_tag: default_tag
                    }
                }
            
                var updateAgents = {
                    url: '/api/v2/users/'+agent_id+'.json',
                    type: 'PUT',
                    dataType: 'json',
                    data: {user:update_array}
                }
            
                //Updating single agent at a time because UpdateMany user API is producing error from Zendesk side.
                //The request is in process with Zendesk team.
            
                client.request(updateAgents).then(function(data) {
                    instance.agents[agent_key].user_fields.agent_activity_tag  =  data.user.user_fields.agent_activity_tag;
                    console.log(data);
                    client.invoke('notify', 'Default tag added '+agent_name, 'notice', 3000);
                },function(err){
                    //console.log(err);
                    client.invoke('notify', 'Error: Tag not updated for '+agent_name, 'error', 3000);
                });
            },            
            saveSetting:function(){
                var instance = this;
                var agentsToUpdate = [];
                instance.agents.forEach((agent,key) => {
                    var update_array = {
                        email: instance.agents[key].email,
                        user_fields: {
                            agent_activity_setting: instance.agents[key].user_fields.agent_activity_setting,
                            agent_activity_tag: instance.agents[key].user_fields.agent_activity_tag
                        }
                    }
                    instance.requests.updateAgents.url = '/api/v2/users/'+instance.agents[key].id+'.json';
                    instance.requests.updateAgents.data = {user:update_array};

                    //Updating single agent at a time because UpdateMany user API is producing error from Zendesk side.
                    //The request is in process with Zendesk team.

                    client.request(instance.requests.updateAgents).then(function(data) {
                        //console.log(data);
                        client.invoke('notify', 'Setings updated for '+instance.agents[key].name, 'notice', 3000);
                    },function(err){
                        //console.log(err);
                        client.invoke('notify', 'Error: Settings not updated for '+instance.agents[key].name, 'error', 3000);
                    });
                });
            },
            globalSettingManager:function(){
                var instance = this;
                instance.agents.forEach((agent,key) => {
                    instance.agents[key].user_fields.agent_activity_setting = instance.global_setting;
                });
            },
            routeToUser:function(id){
                client.invoke('routeTo', 'ticket', id)
            }
        }
    })
}
