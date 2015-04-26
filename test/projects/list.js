var assert = require('assert');

module.exports = function (macro) {
  return {
    'Projects': {
      'Listing them with a member': {
        topic: function () {
          macro.get('/orgs/confyio/projects', {user:'vanstee', pass:'password'}, this.callback);
        },
        'should return 200': macro.status(200),
        'should return array of projects': function (err, res, body) {
          assert.lengthOf(body, 1);
        },
        'should return projects with user as member': function (err, res, body) {
          assert.equal(body[0]._id, 'orgs/confyio/projects/knowledge-base');
        },
        'should return teams array for projects': function (err, res, body) {
          assert.deepEqual(body[0].teams, ['owners', 'consultants']);
        },
        'should not return users': function (err, res, body) {
          assert.isUndefined(body[0].users);
        }
      },
      'Listing them with a non-member': {
        topic: function () {
          macro.get('/orgs/confyio/projects', {user:'mdeiters', pass:'password'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        }
      },
      'Listing them with a member but empty projects': {
        topic: function () {
          macro.get('/orgs/confyio/projects', {user:'shea', pass:'password'}, this.callback);
        },
        'should return 200': macro.status(200),
        'should return empty array of projects': function (err, res, body) {
          assert.lengthOf(body, 0);
        }
      }
    }
  };
}
