'use strict';

var nock = require('nock');
var lambda = require('../');
var payload = require('./fixtures/sns-lambda-payload.json');

var token = 'token';
var room = 'room';
var hipchatUrl = 'https://api.hipchat.com';

var context = function (succeed, fail) {
	return {
		fail: function (e) {
			return fail(e);
		},
		succeed: function (m) {
			return succeed(m);
		}
	}
};

describe('codedeploy-sns-hipchat', function () {
	after(function () {
		nock.cleanAll();
	});

	it('should send message to hipchat', function (done) {
		nock(hipchatUrl)
			.post('/v2/room/' + room + '/notification?auth_token=' + token, {
				color: 'green',
				message: 'Deployment (d-XXXXX) to myApplication (development) SUCCEEDED',
				notify: true,
				message_format: 'text'
			})
			.reply(204);

		lambda.handler(payload, context(
			function () {
				done();
			},
			done
		));
	});
});
