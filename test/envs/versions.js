var assert = require('assert');

module.exports = function (macro) {
  return {
    'Environment Versions': {
      'Listing them with no access': {
        topic: function () {
          macro.get('/orgs/confyio/projects/main/envs/production/versions', {user: 'vanstee', pass: 'password'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {'message':'Not found'});
        }
      },
      'Listing them with member': {
        topic: function () {
          macro.get('/orgs/confyio/projects/knowledge-base/envs/production/versions', {user:'vanstee', pass:'password'}, this.callback);
        },
        'should return 200': macro.status(200),
        'should return array of versions': function (err, res, body) {
          assert.lengthOf(body, 2);
        },
        'should return versions from the database': function (err, res, body) {
          assert.equal(body[0].config, "EWcdL4M3UHUsdpYZKZTnYQ==RDsiGWvifNeWqrLKz9MDRQ==");
          assert.equal(body[0].time, 1427638419608);
          assert.equal(body[1].config.database.url, "http://db.confy.io");
          assert.equal(body[1].time, 1427633285584);
        }
      }
    }
  };
}
