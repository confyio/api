var assert = require('assert');

module.exports = function (macro) {
  return {
    'Projects': {
      'Creating them using non-member': {
        topic: function () {
          macro.post('/orgs/confyio/projects', {}, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        }
      },
      'Creating them using member': {
        topic: function () {
          macro.post('/orgs/confyio/projects', {}, {user:'vanstee', pass:'password'}, this.callback);
        },
        'should return 401': macro.status(401),
        'should return bad credentials': function (err, res, body) {
          assert.deepEqual(body, {message: 'Bad credentials'});
        }
      },
      'Creating them with missing params': {
        topic: function () {
          macro.post('/orgs/fire-size/projects', {}, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(3)
      },
      'Creating them with existing name': {
        topic: function () {
          macro.post('/orgs/confyio/projects', {
            name: 'Main', description: 'Main'
          }, {user:'pksunkara', pass:'password'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['name', 'already_exists']])
      },
      'Creating them with too short name': {
        topic: function () {
          macro.post('/orgs/confyio/projects', {
            name: 'P', description: 'Short Name'
          }, {user:'pksunkara', pass:'password'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['name', 'invalid']])
      },
      'Creating them with too lengthy name': {
        topic: function () {
          macro.post('/orgs/confyio/projects', {
            name: 'Project Management', description: 'Lengthy Name'
          }, {user:'pksunkara', pass:'password'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['name', 'invalid']])
      },
      'Creating them with heroku user': {
        topic: function () {
          macro.post('/orgs/app123/projects', {
            name: 'Main', description: 'Main'
          }, {user:'app123', pass:'password'}, this.callback);
        },
        'should return 403': macro.status(403),
        'should return forbidden': function (err, res, body) {
          assert.deepEqual(body, {'message':'Forbidden action'});
        }
      },
      'Creating them': {
        topic: function () {
          macro.post('/orgs/fire-size/projects', {
            name: 'Main App', description: 'Main web application',
            random: '1e3', org: 'confyio'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 201': macro.status(201),
        'should return project': function (err, res, body) {
          assert.equal(body._id, 'orgs/fire-size/projects/main-app');
          assert.equal(body.name, 'Main App');
          assert.equal(body.description, 'Main web application');
          assert.equal(body.org, 'fire-size');
          assert.equal(body.type, 'project');
        },
        'should not save other keys': function (err, res, body) {
          assert.isUndefined(body.random);
        },
        'should have access for default team': function (err, res, body) {
          assert.deepEqual(body.teams, ['owners']);
        },
        'should not return users': function (err, res, body) {
          assert.isUndefined(body.users);
        },
        'should create project doc and it': macro.doc('orgs/fire-size/projects/main-app', {
          'should have users from "owners" team': function (err, body) {
            assert.deepEqual(body.users, {jsmith: 1});
          },
          'should have access for default team': function (err, body) {
            assert.deepEqual(body.teams, {owners:true});
          }
        }),
        'should create project environment doc and it': macro.doc('orgs/fire-size/projects/main-app/envs/production')
      }
    }
  };
}
