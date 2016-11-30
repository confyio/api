var assert = require('assert');

module.exports = function (macro) {
  return {
    'Environments': {
      'Creating them using non-member': {
        topic: function () {
          macro.post('/orgs/confyio/projects/main/envs', {}, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        }
      },
      'Creating them with missing params by member': {
        topic: function () {
          macro.post('/orgs/confyio/projects/knowledge-base/envs', {}, {user:'vanstee', pass:'password'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(3)
      },
      'Creating them with existing name': {
        topic: function () {
          macro.post('/orgs/confyio/projects/main/envs', {
            name: 'Production', description: 'Production'
          }, {user:'pksunkara', pass:'password'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['name', 'already_exists']])
      },
      'Creating them with too short name': {
        topic: function () {
          macro.post('/orgs/confyio/projects/main/envs', {
            name: 'E', description: 'Short Name'
          }, {user:'pksunkara', pass:'password'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['name', 'invalid']])
      },
      'Creating them with too lengthy name': {
        topic: function () {
          macro.post('/orgs/confyio/projects/main/envs', {
            name: 'Environment Management', description: 'Lengthy Name'
          }, {user:'pksunkara', pass:'password'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['name', 'invalid']])
      },
      'Creating them with invalid name': {
        topic: function () {
          macro.post('/orgs/confyio/projects/main/envs', {
            name: '$@*', description: 'Production'
          }, {user:'pksunkara', pass:'password'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['name', 'invalid']])
      },
      'Creating them': {
        topic: function () {
          macro.post('/orgs/fire-size/projects/main-app/envs', {
            name: 'Staging Beta', description: 'Staging',
            random: '1e3', org: 'fire-size'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 201': macro.status(201),
        'should return environment': function (err, res, body) {
          assert.equal(body._id, 'orgs/fire-size/projects/main-app/envs/staging-beta');
          assert.equal(body.name, 'Staging Beta');
          assert.equal(body.description, 'Staging');
          assert.equal(body.project, 'main-app');
          assert.equal(body.org, 'fire-size');
          assert.equal(body.type, 'env');
          assert.isDefined(body.token);
        },
        'should not save other keys': function (err, res, body) {
          assert.isUndefined(body.random);
        },
        'should not return config': function (err, res, body) {
          assert.isUndefined(body.config);
        },
        'should not return versions': function (err, res, body) {
          assert.isUndefined(body.versions);
        },
        'should create environment doc and it': macro.doc('orgs/fire-size/projects/main-app/envs/staging-beta')
      }
    }
  };
}
