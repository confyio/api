var assert = require('assert');

module.exports = function (macro) {
  return {
    'Environments': {
      'Deleting non-existent envrionment': {
        topic: function () {
          macro.delete('/orgs/confyio/projects/main/envs/stuff', {}, {user: 'pksunkara', pass: 'password'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        }
      },
      'Deleting environment with owner': {
        topic: function () {
          macro.delete('/orgs/confyio/projects/main/envs/production', {}, {user: 'pksunkara', pass: 'password'}, this.callback);
        },
        'should return 204': macro.status(204),
        'should not return the environment': function (err, res, body) {
          assert.isUndefined(body);
        },
        'should delete envrionment doc and it': macro.nodoc('orgs/confyio/projects/main/envs/production', 'deleted')
      },
      'Deleting envrionment with member': {
        topic: function () {
          macro.delete('/orgs/fire-size/projects/main-app/envs/staging-beta', {}, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 204': macro.status(204),
        'should not return the envrionment': function (err, res, body) {
          assert.isUndefined(body);
        },
        'should delete envrionment doc and it': macro.nodoc('orgs/fire-size/projects/main-app/envs/staging-beta', 'deleted')
      },
      'Deleting envrionment with no access': {
        topic: function () {
          macro.delete('/orgs/confyio/projects/knowledge-base/envs/production', {}, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        },
        'should not delete envrionment doc and it': macro.doc('orgs/confyio/projects/knowledge-base/envs/production')
      }
    }
  };
}
