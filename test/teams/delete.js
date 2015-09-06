var assert = require('assert');

module.exports = function (macro) {
  return {
    'Teams': {
      'Deleting non-existent team': {
        topic: function () {
          macro.delete('/orgs/confyio/teams/stuff', {}, {user: 'pksunkara', pass: 'password'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        }
      },
      'Deleting the default team': {
        topic: function () {
          macro.delete('/orgs/confyio/teams/owners', {}, {user: 'pksunkara', pass: 'password'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['team', 'forbidden']])
      },
      'Deleting team with owner': {
        topic: function () {
          macro.delete('/orgs/confyio/teams/consultants', {}, {user: 'pksunkara', pass: 'password'}, this.callback);
        },
        'should return 204': macro.status(204),
        'should not return the team': function (err, res, body) {
          assert.isUndefined(body);
        },
        'should delete team doc and it': macro.nodoc('orgs/confyio/teams/consultants', 'deleted'),
        'should update project doc and it': macro.doc('orgs/confyio/projects/knowledge-base', {
          'should remove team from team list': function (err, body) {
            assert.isUndefined(body.teams['consultants']);
          },
          'should decrement the count for the users': function (err, body) {
            assert.isUndefined(body.users['vanstee']);
            assert.equal(body.users['pksunkara'], 1);
          }
        }),
        'should update org doc and it': macro.doc('orgs/confyio', {
          'should decrement the count for the users': function (err, body) {
            assert.isUndefined(body.users['vanstee']);
            assert.equal(body.users['pksunkara'], 3);
          }
        })
      },
      'Deleting team with member': {
        topic: function () {
          macro.delete('/orgs/confyio/teams/designers', {}, {user: 'shea', pass: 'password'}, this.callback);
        },
        'should return 401': macro.status(401),
        'should return bad credentials': function (err, res, body) {
          assert.deepEqual(body, {message: 'Bad credentials'});
        },
        'should not delete team doc and it': macro.doc('orgs/confyio/teams/designers')
      },
      'Deleting team with no access': {
        topic: function () {
          macro.delete('/orgs/confyio/teams/designers', {}, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        },
        'should not delete team doc and it': macro.doc('orgs/confyio/teams/designers')
      },
      'Deleting team with heroku user': {
        topic: function () {
          macro.delete('/orgs/app123/teams/owners', {}, {user: 'app123', pass: 'password'}, this.callback);
        },
        'should return 403': macro.status(403),
        'should return forbidden': function (err, res, body) {
          assert.deepEqual(body, {'message':'Forbidden action'});
        }
      }
    }
  };
}
