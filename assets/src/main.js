var client = ZAFClient.init();

client.on('app.registered', function appRegistered(e) {
    init();
});


function init() {

    var clientPromise = client.get('instances').then(function(instancesData) {
        var instances = instancesData.instances;
        for (var instanceGuid in instances) {
            if (instances[instanceGuid].location === 'background') {
               return client.instance(instanceGuid);
            }
        }
        return false;
    });

    clientPromise.then(function(backgroundData) {
        // trigger an incoming_call event on the top bar
        client.get('ticket.type').then(function(data){
            if(data['ticket.type']=='problem' || data['ticket.type']=='incident'){
                addActions(data['ticket.type']);
            }
        });
    });
}

function addActions(ticketType) {
    console.log(ticketType);
}