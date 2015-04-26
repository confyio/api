var assert = require('assert');

module.exports = function (macro) {
  return {
    'Teams': {
      'Listing them with a member': {
        topic: function () {
          macro.get('/orgs/confyio/teams', {user:'vanstee', pass:'password'}, this.callback);
        },
        'should return 200': macro.status(200),
        'should return array of teams': function (err, res, body) {
          assert.lengthOf(body, 1);
        },
        'should return teams with user as member': function (err, res, body) {
          assert.equal(body[0]._id, 'orgs/confyio/teams/consultants');
        },
        'should return users array for teams': function (err, res, body) {
          assert.deepEqual(body[0].users, ['pksunkara','whatupdave','vanstee']);
        }
      },
      'Listing them with a non-member': {
        topic: function () {
          macro.get('/orgs/confyio/teams', {user:'mdeiters', pass:'password'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        }
      }
    }
  };
}
