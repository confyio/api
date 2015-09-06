var assert = require('assert');

module.exports = function (macro) {
  return {
    'Teams': {
      'Adding member to team with missing params': {
        topic: function () {
          macro.post('/orgs/fire-size/teams/dev-gods/member', {}, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(2)
      },
      'Adding member to team with non-existent user': {
        topic: function () {
          macro.post('/orgs/fire-size/teams/dev-gods/member', {
            user: 'sunkara'
          }, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['user', 'does_not_exist']])
      },
      'Adding member to team with too short name': {
        topic: function () {
          macro.post('/orgs/fire-size/teams/dev-gods/member', {
            user: 'u'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['user', 'invalid']])
      },
      'Adding member to team with too lengthy name': {
        topic: function () {
          macro.post('/orgs/fire-size/teams/dev-gods/member', {
            user: 'iamtoolengthyusername'
          }, {user:'jsmith', pass:'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['user', 'invalid']])
      },
      'Adding member to team': {
        topic: function () {
          macro.post('/orgs/confyio/teams/engineering/member', {
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
          assert.deepEqual(body.users, ['pksunkara', 'mdeiters']);
        },
        'should update the team doc and it': macro.doc('orgs/confyio/teams/engineering', {
          'should have new user in users list': function (err, body) {
            assert.isTrue(body.users['mdeiters']);
          }
        }),
        'should update the org doc and it': macro.doc('orgs/confyio', {
          'should increment the count for the user': function (err, body) {
            assert.equal(body.users['mdeiters'], 1);
          }
        }),
        'should update the project doc and it': macro.doc('orgs/confyio/projects/main', {
          'should increment the count for the user': function (err, body) {
            assert.equal(body.users['mdeiters'], 1);
          }
        })
      },
      'Adding already member to team': {
        topic: function () {
          macro.post('/orgs/fire-size/teams/dev-gods/member', {
            user: 'jsmith', random: 'u2e83'
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
        'should not update the org doc and it': macro.doc('orgs/fire-size', {
          'should not increment the count for the user': function (err, body) {
            assert.equal(body.users['jsmith'], 2);
          }
        })
      },
      'Adding member to team with member': {
        topic: function () {
          macro.post('/orgs/confyio/teams/consultants/member', {
            user: 'mdeiters',
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
      'Adding member to team with no access': {
        topic: function () {
          macro.post('/orgs/confyio/teams/consultants/member', {
            user: 'mdeiters',
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
