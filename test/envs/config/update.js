var assert = require('assert');

module.exports = function (macro) {
  return {
    'Environment Configuration': {
      'Updating them with non-member': {
        topic: function () {
          macro.put('/orgs/confyio/projects/main/envs/production/config', {}, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        }
      },
      'Updating them with member': {
        topic: function () {
          macro.put('/orgs/confyio/projects/main/envs/production/config', {
            _deleted: true, _id: 'hacked', name: null,
            port: 3000, database: { port: 6984 }
          }, {user: 'pksunkara', pass: 'password'}, this.callback);
        },
        'should return 200': macro.status(200),
        'should return updated config': function (err, res, body) {
          assert.equal(body._deleted, true);
          assert.equal(body.port, 3000);
          assert.isNull(body.name);
        },
        'should not have _id': function (err, res, body) {
          assert.isUndefined(body._id);
        },
        'should not recursively update': function (err, res, body) {
          assert.equal(body.database.port, 6984);
          assert.isUndefined(body.database.pass);
        },
        'should update the environment doc and it': macro.doc('orgs/confyio/projects/main/envs/production', {
          'should be replaced': function (err, body) {
            assert.equal(body.config._deleted, true);
            assert.equal(body.config.port, 3000);
            assert.isNull(body.config.name);
            assert.equal(body.config.database.port, 6984);
            assert.isUndefined(body.config.database.pass);
            assert.isUndefined(body.config._id);
          },
          'should have editor in versions': function (err, body) {
            assert.equal(body.versions[0].user, 'pksunkara');
          },
        })
      }
    }
  };
}
