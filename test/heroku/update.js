var assert = require('assert');

module.exports = function (macro) {
  return {
    'Heroku': {
      'Updating config with non-heroku user': {
        topic: function () {
          macro.put('/heroku/config', {}, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 403': macro.status(403),
        'should return forbidden': function (err, res, body) {
          assert.deepEqual(body, {'message':'Forbidden action'});
        }
      },
      'Updating config with heroku user': {
        topic: function () {
          macro.put('/heroku/config', {
            port: null, db: 'pavan'
          }, {user:'app123', pass:'password'}, this.callback);
        },
        'should return 200': macro.status(200),
        'should update the env doc and it': macro.doc('orgs/app123/projects/app/envs/production', {
          'should have update config': function (err, body) {
            assert.isNull(body.config.port);
            assert.equal(body.config.db, 'pavan');
          },
          'should have added the new versions': function (err, body) {
            assert.equal(body.versions.length, 10);
            assert.isNull(body.versions[0].config.port);
            assert.equal(body.versions[0].config.db, 'pavan');
          },
          'should have removed the old versions': function (err, body) {
            assert.equal(body.versions.length, 10);
            assert.equal(body.versions[9].config.port, 8008);
            assert.equal(body.versions[9].time, 1427633285584);
          }
        })
      }
    }
  };
}
