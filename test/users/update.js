var assert = require('assert')
  , redis = require('redis').createClient();

module.exports = function (macro) {
  return {
    'Users': {
      'Updating authenticated user': {
        topic: function () {
          macro.patch('/user', {
            email: 'john.smith@gmail.com',
            fullname: 'John Kay Smith',
            random: 'eu9fh7e98f', username: 'hacked'
          }, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 200': macro.status(200),
        'should return the user': function (err, res, body) {
          assert.equal(body._id, 'users/jsmith');
          assert.equal(body.username, 'jsmith');
          assert.equal(body.type, 'user');
          assert.isFalse(body.verified);
        },
        'should update the fullname': function (err, res, body) {
          assert.equal(body.fullname, 'John Kay Smith');
        },
        'should update the email': function (err, res, body) {
          assert.equal(body.email, 'john.smith@gmail.com');
        },
        'should not return the token': function (err, res, body) {
          assert.isUndefined(body.token);
        },
        'should not update random fields': function (err, res, body) {
          assert.isUndefined(body.random);
        },
        'should not retun password': function (err, res, body) {
          assert.isUndefined(body.password);
        },
        'should not retun verification token': function (err, res, body) {
          assert.isUndefined(body.verification_token);
          assert.isUndefined(body.verify_new_email);
        },
        'should update user doc and it': macro.doc('users/jsmith', {
          'should have updated email': function (err, body) {
            assert.equal(body.email, 'john.smith@gmail.com');
          },
          'should have updated fullname': function (err, body) {
            assert.equal(body.fullname, 'John Kay Smith');
          },
          'should have verification token': function (err, body) {
            assert.equal(body.verification_token.length, 40);
            assert.isTrue(body.verify_new_email);
          }
        })
      },
      'Updating logged in user': {
        topic: function () {
          macro.patch('/user?access_token=43fb9585328895005ca74bb33a1c46db5b835f2d', {
            fullname: 'Pavan Sunkara',
            email: 'pavan.sss1991@gmail.com'
          }, null, this.callback);
        },
        'should return 401': macro.status(401),
        'should return bad credentials': function (err, res, body) {
          assert.deepEqual(body, {message: 'Bad credentials'});
        },
        'should not update user doc and it': macro.doc('users/pksunkara', {
          'should have old fullname': function (err, body) {
            assert.equal(body.fullname, 'Pavan Kumar Sunkara');
          }
        })
      },
      'Updating user with already taken email': {
        topic: function () {
          macro.patch('/user', {
            email: 'pavan.sss1991@gmail.com'
          }, {user: 'whatupdave', pass: 'password'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['email', 'already_exists']]),
        'should not update user doc and it': macro.doc('users/whatupdave', {
          'should have old email': function (err, body) {
            assert.equal(body.email, 'dave@snappyco.de');
          }
        })
      },
      'Updating user with invalid email': {
        topic: function () {
          macro.patch('/user', {
            email: 'invalid@email'
          }, {user: 'whatupdave', pass: 'password'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['email', 'invalid']]),
        'should not update user doc and it': macro.doc('users/whatupdave', {
          'should have old email': function (err, body) {
            assert.equal(body.email, 'dave@snappyco.de');
          }
        })
      },
      'Updating authenticated user excluding email': {
        topic: function () {
          macro.patch('/user', {
            fullname: 'Patrick van Stee',
            email: 'patrick@vanstee.me'
          }, {user: 'vanstee', pass: 'password'}, this.callback);
        },
        'should return 200': macro.status(200),
        'should return the user': function (err, res, body) {
          assert.equal(body._id, 'users/vanstee');
          assert.equal(body.username, 'vanstee');
          assert.equal(body.email, 'patrick@vanstee.me');
          assert.equal(body.type, 'user');
          assert.isTrue(body.verified);
        },
        'should update the fullname': function (err, res, body) {
          assert.equal(body.fullname, 'Patrick van Stee');
        },
        'should return the token': function (err, res, body) {
          assert.isString(body.token);
        },
        'should not retun password': function (err, res, body) {
          assert.isUndefined(body.password);
        },
        'should not return access token': function (err, res, body) {
          assert.isUndefined(body.access_token);
        },
        'should update user doc and it': macro.doc('users/vanstee', {
          'should have updated fullname': function (err, body) {
            assert.equal(body.fullname, 'Patrick van Stee');
          },
          'should not have verification token': function (err, body) {
            assert.isUndefined(body.verification_token);
            assert.isUndefined(body.verify_new_email);
          }
        }),
        'should have the access token in redis': {
          topic: function (res, body) {
            redis.get('confy_' + body.token, this.callback);
          },
          'and it should return the user': function (err, body) {
            body = JSON.parse(body);

            assert.equal(body._id, 'users/vanstee');
            assert.equal(body.username, 'vanstee');
            assert.equal(body.fullname, 'Patrick van Stee');
            assert.equal(body.email, 'patrick@vanstee.me');
            assert.equal(body.type, 'user');
            assert.isTrue(body.verified);
          }
        },
        'and counting redis keys': macro.redis(4, 'four')
      }
    }
  }
}
