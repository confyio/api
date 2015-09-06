var assert = require('assert');

module.exports = function (macro) {
  return {
    'Teams': {
      'Removing member from team with missing params': {
        topic: function () {
          macro.delete('/orgs/fire-size/teams/dev-gods/member', {}, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(2)
      },
      'Removing member from team': {
        topic: function () {
          macro.delete('/orgs/confyio/teams/engineering/member', {
            user: 'mdeiters', random: 'u2e83'
          }, {user: 'pksunkara', pass: 'password'}, this.callback);
        },
        'should return 200': macro.status(200),
        'should return the team doc': function (err, res, body) {
          assert.equal(body._id, 'orgs/confyio/teams/engineering');
          assert.equal(body.name, 'Engineering');
          assert.equal(body.description, 'Engineers in the company');
          assert.equal(body.org, 'confyio');
          assert.equal(body.type, 'team');
        },
        'should not return random fields': function (err, res, body) {
          assert.isUndefined(body.random);
        },
        'should return users array': function (err, res, body) {
          assert.deepEqual(body.users, ['pksunkara']);
        },
        'should update the team doc and it': macro.doc('orgs/confyio/teams/engineering', {
          'should not have user in users list': function (err, body) {
            assert.isUndefined(body.users['mdeiters']);
          }
        }),
        'should update the org doc and it': macro.doc('orgs/confyio', {
          'should decrement the count for the user': function (err, body) {
            assert.isUndefined(body.users['mdeiters']);
          }
        }),
        'should update the project doc and it': macro.doc('orgs/confyio/projects/main', {
          'should decrement the count for the user': function (err, body) {
            assert.isUndefined(body.users['mdeiters']);
          }
        })
      },
      'Removing owner member from team': {
        topic: function () {
          macro.delete('/orgs/fire-size/teams/dev-gods/member', {
            user: 'jsmith'
          }, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['user', 'forbidden']]),
        'should not update the team doc and it': macro.doc('orgs/fire-size/teams/dev-gods', {
          'should have owner in users list': function (err, body) {
            assert.isTrue(body.users['jsmith']);
          }
        }),
        'should not update the org doc and it': macro.doc('orgs/fire-size', {
          'should not change the count for the user': function (err, body) {
            assert.equal(body.users['jsmith'], 2);
          }
        })
      },
      'Removing non-member from team': {
        topic: function () {
          macro.delete('/orgs/fire-size/teams/dev-gods/member', {
            user: 'vanstee'
          }, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 200': macro.status(200),
        'should return the team doc': function (err, res, body) {
          assert.equal(body._id, 'orgs/fire-size/teams/dev-gods');
          assert.equal(body.name, 'Dev Gods');
          assert.equal(body.description, 'Main product developers');
          assert.equal(body.org, 'fire-size');
          assert.equal(body.type, 'team');
        },
        'should not update the team doc and it': macro.doc('orgs/fire-size/teams/dev-gods', {
          'should not have user in users list': function (err, body) {
            assert.isUndefined(body.users['vanstee']);
          }
        }),
        'should not update the org doc and it': macro.doc('orgs/fire-size', {
          'should not change the count for the user': function (err, body) {
            assert.isUndefined(body.users['vanstee']);
          }
        })
      },
      'Removing member from team with member': {
        topic: function () {
          macro.delete('/orgs/confyio/teams/consultants/member', {
            user: 'whatupdave',
          }, {user: 'vanstee', pass: 'password'}, this.callback);
        },
        'should return 401': macro.status(401),
        'should return bad credentials': function (err, res, body) {
          assert.deepEqual(body, {message: 'Bad credentials'});
        },
        'should not update team doc and it': macro.doc('orgs/confyio/teams/consultants', {
          'should have old users': function (err, body) {
            assert.lengthOf(Object.keys(body.users), 3);
          }
        })
      },
      'Removing member from team with no access': {
        topic: function () {
          macro.delete('/orgs/confyio/teams/consultants/member', {
            user: 'whatupdave',
          }, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        },
        'should not update team doc and it': macro.doc('orgs/confyio/teams/consultants', {
          'should have old users': function (err, body) {
            assert.lengthOf(Object.keys(body.users), 3);
          }
        })
      }
    }
  };
}
