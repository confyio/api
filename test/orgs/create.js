var assert = require('assert');

module.exports = function (macro) {
  return {
    'Orgs': {
      'Creating them with missing params': {
        topic: function () {
          macro.post('/orgs', {}, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(4)
      },
      'Creating them with existing name': {
        topic: function () {
          macro.post('/orgs', {
            name: 'pksunkara', email: 'pk@sunkara.com'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['name', 'already_exists']])
      },
      'Creating them with too short name': {
        topic: function () {
          macro.post('/orgs', {
            name: 'O', email: 'minlength@confytest.io'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['name', 'invalid']])
      },
      'Creating them with too lengthy name': {
        topic: function () {
          macro.post('/orgs', {
            name: 'Organization Management', email: 'maxlength@confytest.io'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['name', 'invalid']])
      },
      'Creating them with invalid email': {
        topic: function () {
          macro.post('/orgs', {
            name: 'John Smith', email: 'johnsmith@invalidemail'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['email', 'invalid']])
      },
      'Creating them with heroku user': {
        topic: function () {
          macro.post('/orgs', {
            name: 'HerokuOrg', email: 'johnsmith@gmail.com',
          }, {user:'app123', pass:'password'}, this.callback);
        },
        'should return 403': macro.status(403),
        'should return forbidden': function (err, res, body) {
          assert.deepEqual(body, {'message':'Forbidden action'});
        }
      },
      'Creating them': {
        topic: function () {
          macro.post('/orgs', {
            name: 'Fire Size', email: 'johnsmith@gmail.com',
            random: '123xyz', owner: 'stuff'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 201': macro.status(201),
        'should return org': function (err, res, body) {
          assert.equal(body._id, 'orgs/fire-size');
          assert.equal(body.name, 'Fire Size');
          assert.equal(body.email, 'johnsmith@gmail.com');
          assert.equal(body.owner, 'jsmith');
          assert.equal(body.type, 'org');
          assert.equal(body.plan, 'none');
        },
        'should not save other keys': function (err, res, body) {
          assert.isUndefined(body.random);
        },
        'should create org doc and it': macro.doc('orgs/fire-size', {
          'should have user as owner': function (err, body) {
            assert.equal(body.owner, 'jsmith');
          },
          'should have user in list of users': function (err, body) {
            assert.deepEqual(body.users, {jsmith: 1});
          },
          'should have default plan empty': function (err, body) {
            assert.equal(body.plan, 'none');
          }
        }),
        'should create default team doc and it': macro.doc('orgs/fire-size/teams/owners', {
          'should be default for org': function (err, body) {
            assert.equal(body.name, 'Owners');
            assert.equal(body.type, 'team');
            assert.equal(body.description, 'Has access to all projects');
            assert.equal(body.org, 'fire-size');
          },
          'should have user in list of users': function (err, body) {
            assert.deepEqual(body.users, {jsmith: true});
          }
        })
      }
    }
  };
}
