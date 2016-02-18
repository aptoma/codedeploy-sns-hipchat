'use strict';

var http = require('https');

// Modify for mapping app to rooms
// Room tokens are created at https://<company>.hipchat.com/admin/rooms
var applications = {
    'myApplication': {
        room: 'room',
        token: 'token'
    }
}

exports.handler = function(event, context) {
    var msg = JSON.parse(event.Records[0].Sns.Message);
    var app = applications[msg.applicationName];

    if (!app) {
        return context.fail('No configuration found for ' + msg.applicationName);
    }

    var hipchatColor = 'gray';

    if (msg.status === 'SUCCEEDED') {
        hipchatColor = 'green';
    } else if (msg.status === 'FAILED') {
        hipchatColor = 'red';
    }

    var body = JSON.stringify({
        color: hipchatColor,
        message: 'Deployment (' + msg.deploymentId + ') to ' + msg.applicationName + ' (' + msg.deploymentGroupName + ') ' + msg.status,
        notify: true,
        message_format: 'text',
    });

    var httpOptions = {
        host: 'api.hipchat.com',
        port: 443,
        method: 'POST',
        path: '/v2/room/' + app.room + '/notification?auth_token=' + app.token,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    var req = http.request(httpOptions, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            console.log('HipChat Response Body', data);
        });
        res.on('end', function () {
            if (res.statusCode === 204) {
                context.succeed('message delivered to hipchat');
            } else {
                context.fail('hipchat API returned an error');
            }
        });
    });

    req.on('error', function(e) {
        context.fail('HipChat Request Failed: ' + e.message);
    });

    req.write(body);
    req.end();
};
