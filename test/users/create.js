var assert = require('assert');

module.exports = function (macro) {
  return {
    'Users': {
      'Creating them with missing params': {
        topic: function () {
          macro.post('/user', {}, null, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(6)
      },
      'Creating them with existing email': {
        topic: function () {
          macro.post('/user', {
            username: 'jsmith', password: 'secret',
            email: 'pavan.sss1991@gmail.com'
          }, null, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['email', 'already_exists']])
      },
      'Creating them with existing username': {
        topic: function () {
          macro.post('/user', {
            username: 'pksunkara', password: 'secret',
            email: 'pk@sunkara.com'
          }, null, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['username', 'already_exists']])
      },
      'Creating them with too short username': {
        topic: function () {
          macro.post('/user', {
            username: 'u', password: 'tooshort',
            email: 'tooshort@confytest.com'
          }, null, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['username', 'invalid']])
      },
      'Creating them with too lengthy username': {
        topic: function () {
          macro.post('/user', {
            username: 'iamtoolengthyusername', password: 'toolengthy',
            email: 'toolengthy@confytest.com'
          }, null, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['username', 'invalid']])
      },
      'Creating them with invalid username': {
        topic: function () {
          macro.post('/user', {
            username: '@$*', password: 'secret',
            email: 'pk@sunkara.com'
          }, null, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['username', 'invalid']])
      },
      'Creating them with invalid email': {
        topic: function () {
          macro.post('/user', {
            username: 'jsmith', password: 'invalidemail',
            email: 'invalid@email'
          }, null, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['email', 'invalid']])
      },
      'Creating them': {
        topic: function () {
          macro.post('/user', {
            username: 'jsmith',
            fullname: 'John Smith',
            password: 'secret',
            email: 'johnsmith@gmail.com',
            random: '123xyz'
          }, null, this.callback);
        },
        'should return 201': macro.status(201),
        'should return user': function (err, res, body) {
          assert.equal(body._id, 'users/jsmith');
          assert.equal(body.username, 'jsmith');
          assert.equal(body.fullname, 'John Smith');
          assert.equal(body.email, 'johnsmith@gmail.com');
          assert.equal(body.type, 'user');
          assert.isFalse(body.verified);
        },
        'should not return password': function (err, res, body) {
          assert.isUndefined(body.password);
        },
        'should not save other keys': function (err, res, body) {
          assert.isUndefined(body.random);
        },
        'should not retun verification token': function (err, res, body) {
          assert.isUndefined(body.verification_token);
          assert.isUndefined(body.verify_new_email);
        },
        'should create user doc and it': macro.doc('users/jsmith', {
          'should have verification token': function (err, body) {
            assert.equal(body.verification_token.length, 40);
            assert.isUndefined(body.verify_new_email);
          }
        }),
        'should create default org doc and it': macro.doc('orgs/jsmith', {
          'should be default for user': function (err, body) {
            assert.equal(body.name, 'John Smith');
            assert.equal(body.type, 'org');
          },
          'should have user as owner': function (err, body) {
            assert.equal(body.owner, 'jsmith');
          },
          'should have user email as billing email': function (err, body) {
            assert.equal(body.email, 'johnsmith@gmail.com');
          },
          'should have user in list of users': function (err, body) {
            assert.deepEqual(body.users, {jsmith: 1});
          }
        }),
        'should create default team doc and it': macro.doc('orgs/jsmith/teams/owners', {
          'should be default for org': function (err, body) {
            assert.equal(body.name, 'Owners');
            assert.equal(body.type, 'team');
            assert.equal(body.description, 'Has access to all projects');
          },
          'should have user in list of users': function (err, body) {
            assert.deepEqual(body.users, {jsmith: true});
          }
        })
      },
      'Creating them with empty fullname': {
        topic: function () {
          macro.post('/user', {
            username: 'pkumar',
            password: 'secret',
            email: 'pkumar@cse.iitm.ac.in'
          }, null, this.callback);
        },
        'should return 201': macro.status(201),
        'should return user': function (err, res, body) {
          assert.equal(body._id, 'users/pkumar');
          assert.equal(body.username, 'pkumar');
          assert.equal(body.fullname, 'pkumar');
          assert.equal(body.email, 'pkumar@cse.iitm.ac.in');
          assert.equal(body.type, 'user');
          assert.isFalse(body.verified);
        },
        'should create default org doc and it': macro.doc('orgs/pkumar', {
          'should be default for user': function (err, body) {
            assert.equal(body.name, 'pkumar');
            assert.equal(body.type, 'org');
          }
        })
      }
    }
  };
}
