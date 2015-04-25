var assert = require('assert')
  , redis = require('redis').createClient();

module.exports = function (macro) {
  return {
    'Users': macro.doc('users/jsmith', {
      'Verifying them': {
        topic: function (body) {
          macro.get('/users/jsmith/verify/' + body.verification_token, null, this.callback);
        },
        'should return 200': macro.status(200),
        'should return the token': function (err, res, body) {
          assert.isString(body.token);
        },
        'should return the user': function (err, res, body) {
          assert.equal(body._id, 'users/jsmith');
          assert.equal(body.username, 'jsmith');
          assert.equal(body.type, 'user');
          assert.isTrue(body.verified);
        },
        'should not return password': function (err, res, body) {
          assert.isUndefined(body.password);
        },
        'should not return access token': function (err, res, body) {
          assert.isUndefined(body.access_token);
        },
        'should update user doc and it': macro.doc('users/jsmith', {
          'should have verified': function (err, body) {
            assert.isTrue(body.verified);
          },
          'should have no verification token': function (err, body) {
            assert.isUndefined(body.verification_token);
            assert.isUndefined(body.verify_new_email);
          },
        }),
        'should have the access token in redis': {
          topic: function (res, body) {
            redis.get('confy_' + body.token, this.callback);
          },
          'and it should return the user': function (err, body) {
            body = JSON.parse(body);

            assert.equal(body._id, 'users/jsmith');
            assert.equal(body.username, 'jsmith');
            assert.equal(body.type, 'user');
            assert.isTrue(body.verified);
          }
        },
      },
      'Verifying non-existent user': {
        topic: function (body) {
          macro.get('/users/god/verify/' + body.verification_token, null, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        }
      }
    })
  };
}
