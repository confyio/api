var assert = require('assert');

module.exports = function (macro) {
  return {
    'Environments': {
      'Resetting token using non-member': {
        topic: function () {
          macro.post('/orgs/confyio/projects/main/envs/production/token', {}, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        }
      },
      'Resetting token': {
        topic: function () {
          macro.post('/orgs/confyio/projects/main/envs/production/token', {}, {user:'pksunkara', pass:'password'}, this.callback);
        },
        'should return 201': macro.status(201),
        'should return environment': function (err, res, body) {
          assert.equal(body._id, 'orgs/confyio/projects/main/envs/production');
          assert.equal(body.name, 'Production');
          assert.equal(body.description, 'Main production environment');
          assert.equal(body.project, 'main');
          assert.equal(body.org, 'confyio');
          assert.equal(body.type, 'env');
          assert.isDefined(body.token);
          assert.notEqual(body.token, 'b3587b32be5a0cd7043680090b1af780e473cb5b');
        },
        'should not return config': function (err, res, body) {
          assert.isUndefined(body.config);
        },
        'should not return versions': function (err, res, body) {
          assert.isUndefined(body.versions);
        }
      }
    }
  };
}
