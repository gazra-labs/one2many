var client = ZAFClient.init();
var isSolved = { isSolved: true };
client.on('app.registered', function appRegistered(e) {
    init();
});


function init() {
    var clientPromise = client.get('instances').then(function (instancesData) {
        var instances = instancesData.instances;
        for (var instanceGuid in instances) {
            if (instances[instanceGuid].location === 'background') {
                return client.instance(instanceGuid);
            }
        }
        return false;
    });

    clientPromise.then(function (backgroundData) {
        // trigger an incoming_call event on the top bar
        client.get(['ticket.type', 'ticket.id', 'ticket.customField:problem_id']).then(function (data) {
            if (data['ticket.type'] == 'problem') {
                getIncidents(data['ticket.id']).then((response) => {
                    console.log(response, 'test');
                });
            } else if (data['ticket.type'] == 'incident') {
                getProblem(data['ticket.customField:problem_id']);
            }
        });
    });

    client.context().then(function (context) {
        /** Ticket Sidebar */
        if (context.location === 'ticket_sidebar') {
            client.invoke('resize', { width: '100%', height: '300px' });
            client.get(['ticket.type', 'ticket.id', 'ticket.customField:problem_id']).then(function (data) {
                if (data['ticket.type'] == 'problem') {
                    client.request({
                        url: '/api/v2/tickets/' + data['ticket.id'] + '/incidents.json',
                        type: 'GET',
                        dataType: 'json'
                    }).then((response) => {

                        renderHTML('tktBar-template', response.tickets[0], "content");
                    })
                }
            })
            
        }
    })

    client.on('ticket.save', function () {
        return new Promise(function (resolve, reject) {
            client.get(['ticket.type', 'ticket.id', 'ticket.customField:problem_id']).then(function (data) {
                if (data['ticket.type'] == 'problem' && !isSolved.isSolved) {
                    reject('Child tickets are not solved');
                } else if (data['ticket.type'] == 'incident') {
                    getProblem(data['ticket.customField:problem_id']);
                    reject('Parent tickets are not saved');
                }
            })
        })

        return 'Child tickets are not saved';
    });
}

function getIncidents(ticketId) {
    return new Promise((resolve, reject) => {
        client.request({
            url: '/api/v2/tickets/' + ticketId + '/incidents.json',
            type: 'GET',
            dataType: 'json'
        }).then((response) => {
            response.tickets.forEach(element => {
                if (element.status !== 'solved') {
                    isSolved.isSolved = false;
                }
            });
            resolve(isSolved);
        }).catch((err) => {
            reject('Something went wrong.');
        })
    })
}

function getProblem(ticketId) {
    client.request({
        url: '/api/v2/tickets/' + ticketId + '.json',
        type: 'GET',
        dataType: 'json'
    }).then((response) => {
        console.log(response, 'prob');
    })
}

function addActions(ticketType) {
    console.log(ticketType);

}

function renderHTML(id, data,renderId) {
    var source = $("#" + id).html();
    var template = Handlebars.compile(source);
    var html = template(data);
    $("#" + renderId).html(html);
}
