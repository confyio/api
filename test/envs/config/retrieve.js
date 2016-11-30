var assert = require('assert');

module.exports = function (macro) {
  return {
    'Environment Configuration': {
      'Retrieving them with non-member': {
        topic: function () {
          macro.get('/orgs/confyio/projects/main/envs/production/config', {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        }
      },
      'Retrieving them with member': {
        topic: function () {
          macro.get('/orgs/confyio/projects/main/envs/production/config', {user: 'pksunkara', pass: 'password'}, this.callback);
        },
        'should return 200': macro.status(200),
        'should return config doc': function (err, res, body) {
          assert.isUndefined(body._id);
          assert.equal(body.port, 5000);
        }
      },
      'Retrieving via token': {
        topic: function () {
          macro.get('/orgs/confyio/config/e3badca8afdcb3cc2603666865cd0eb66c011ee8', null, this.callback);
        },
        'should return 200': macro.status(200),
        'should return config doc': function (err, res, body) {
          assert.isUndefined(body._id);
          assert.deepEqual(body, 'EWcdL4M3UHUsdpYZKZTnYQ==RDsiGWvifNeWqrLKz9MDRQ==')
        }
      },
      'Retrieving via non existent token': {
        topic: function () {
          macro.get('/orgs/confyio/config/a3badca8afdcb3cc2603666865cd0eb66c011ee8', null, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        }
      },
      'Retrieving via non matching org': {
        topic: function () {
          macro.get('/orgs/fire-size/config/a3badca8afdcb3cc2603666865cd0eb66c011ee8', null, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        }
      }
    }
  };
}
