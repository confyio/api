var assert = require('assert');

module.exports = function (macro) {
  return {
    'Teams': {
      'Creating them using non-member': {
        topic: function () {
          macro.post('/orgs/confyio/teams', {}, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        }
      },
      'Creating them using member': {
        topic: function () {
          macro.post('/orgs/confyio/teams', {}, {user:'vanstee', pass:'password'}, this.callback);
        },
        'should return 401': macro.status(401),
        'should return bad credentials': function (err, res, body) {
          assert.deepEqual(body, {message: 'Bad credentials'});
        }
      },
      'Creating them with missing params': {
        topic: function () {
          macro.post('/orgs/fire-size/teams', {}, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(3)
      },
      'Creating them with existing name': {
        topic: function () {
          macro.post('/orgs/fire-size/teams', {
            name: 'Owners', description: 'Developers'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['name', 'already_exists']])
      },
      'Creating them with too short name': {
        topic: function () {
          macro.post('/orgs/fire-size/teams', {
            name: 'T', description: 'Short Name'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['name', 'invalid']])
      },
      'Creating them with too lengthy name': {
        topic: function () {
          macro.post('/orgs/fire-size/teams', {
            name: 'Teams Management', description: 'Lengthy Name'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['name', 'invalid']])
      },
      'Creating them with invalid name': {
        topic: function () {
          macro.post('/orgs/fire-size/teams', {
            name: '$@*', description: 'Developers'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['name', 'invalid']])
      },
      'Creating them with heroku user': {
        topic: function () {
          macro.post('/orgs/app123/teams', {
            name: 'Engineering', description: 'Developers'
          }, {user:'app123', pass:'password'}, this.callback);
        },
        'should return 403': macro.status(403),
        'should return forbidden': function (err, res, body) {
          assert.deepEqual(body, {'message':'Forbidden action'});
        }
      },
      'Creating them': {
        topic: function () {
          macro.post('/orgs/fire-size/teams', {
            name: 'Dev Gods', description: 'Developers',
            random: '1e3', org: 'confyio'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 201': macro.status(201),
        'should return team': function (err, res, body) {
          assert.equal(body._id, 'orgs/fire-size/teams/dev-gods');
          assert.equal(body.name, 'Dev Gods');
          assert.equal(body.description, 'Developers');
          assert.equal(body.org, 'fire-size');
          assert.equal(body.type, 'team');
        },
        'should not save other keys': function (err, res, body) {
          assert.isUndefined(body.random);
        },
        'should return users as array': function (err, res, body) {
          assert.lengthOf(body.users, 1);
        },
        'should have org owner as default user': function (err, res, body) {
          assert.equal(body.users[0], 'jsmith');
        },
        'should create team doc and it': macro.doc('orgs/fire-size/teams/dev-gods', {
          'should have owner in list of users': function (err, body) {
            assert.deepEqual(body.users, {jsmith: true});
          }
        }),
        'should update org doc and it': macro.doc('orgs/fire-size', {
          'should update owner count in users': function (err, body) {
            assert.equal(body.users['jsmith'], 2);
          }
        })
      }
    }
  };
}
