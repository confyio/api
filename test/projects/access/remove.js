var assert = require('assert');

module.exports = function (macro) {
  return {
    'Projects': {
      'Removing team from project with missing params': {
        topic: function () {
          macro.delete('/orgs/fire-size/projects/main-app/access', {}, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(2)
      },
      'Removing team from project': {
        topic: function () {
          macro.delete('/orgs/confyio/projects/main/access', {
            team: 'consultants', random: 'u2e83'
          }, {user: 'pksunkara', pass: 'password'}, this.callback);
        },
        'should return 200': macro.status(200),
        'should return the project doc': function (err, res, body) {
          assert.equal(body._id, 'orgs/confyio/projects/main');
          assert.equal(body.name, 'Main');
          assert.equal(body.description, 'Main app');
          assert.equal(body.org, 'confyio');
          assert.equal(body.type, 'project');
        },
        'should not return random fields': function (err, res, body) {
          assert.isUndefined(body.random);
        },
        'should return teams array': function (err, res, body) {
          assert.deepEqual(body.teams, ['owners', 'engineering']);
        },
        'should not reutn users': function (err, res, body) {
          assert.isUndefined(body.users);
        },
        'should update the project doc and it': macro.doc('orgs/confyio/projects/main', {
          'should not have team in teams list': function (err, body) {
            assert.isUndefined(body.teams['consultants']);
          },
          'should decrement the count for the user': function (err, body) {
            assert.isUndefined(body.users['vanstee']);
            assert.isUndefined(body.users['whatupdave']);
            assert.equal(body.users['pksunkara'], 2);
          }
        })
      },
      'Removing default team from project': {
        topic: function () {
          macro.delete('/orgs/fire-size/projects/main-app/access', {
            team: 'owners'
          }, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 422': macro.status(422),
        'should return validation errors': macro.validation(1, [['team', 'forbidden']]),
        'should not update the project doc and it': macro.doc('orgs/fire-size/projects/main-app', {
          'should have default team in teams list': function (err, body) {
            assert.isTrue(body.teams['owners']);
          }
        }),
        'should not update the org doc and it': macro.doc('orgs/fire-size', {
          'should not change the count for the user': function (err, body) {
            assert.equal(body.users['jsmith'], 2);
          }
        })
      },
      'Removing non-access team from project': {
        topic: function () {
          macro.delete('/orgs/fire-size/projects/main-app/access', {
            team: 'dev'
          }, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 200': macro.status(200),
        'should return the project doc': function (err, res, body) {
          assert.equal(body._id, 'orgs/fire-size/projects/main-app');
          assert.equal(body.name, 'Main App');
          assert.equal(body.description, 'Main api backend');
          assert.equal(body.org, 'fire-size');
          assert.equal(body.type, 'project');
        },
        'should return teams array': function (err, res, body) {
          assert.deepEqual(body.teams, ['owners']);
        },
        'should not reutn users': function (err, res, body) {
          assert.isUndefined(body.users);
        },
        'should not update the project doc and it': macro.doc('orgs/fire-size/projects/main-app', {
          'should not have team in teams list': function (err, body) {
            assert.isUndefined(body.teams['dev']);
          }
        })
      },
      'Removing team from project with member': {
        topic: function () {
          macro.delete('/orgs/confyio/projects/knowledge-base/access', {
            team: 'consultants',
          }, {user: 'vanstee', pass: 'password'}, this.callback);
        },
        'should return 401': macro.status(401),
        'should return bad credentials': function (err, res, body) {
          assert.deepEqual(body, {message: 'Bad credentials'});
        },
        'should not update project doc and it': macro.doc('orgs/confyio/projects/knowledge-base', {
          'should have old teams': function (err, body) {
            assert.lengthOf(Object.keys(body.teams), 2);
          }
        })
      },
      'Removing team from project with no access': {
        topic: function () {
          macro.delete('/orgs/confyio/projects/knowledge-base/access', {
            team: 'consultants',
          }, {user: 'jsmith', pass: 'secret'}, this.callback);
        },
        'should return 404': macro.status(404),
        'should return not found': function (err, res, body) {
          assert.deepEqual(body, {message: 'Not found'});
        },
        'should not update project doc and it': macro.doc('orgs/confyio/projects/knowledge-base', {
          'should have old teams': function (err, body) {
            assert.lengthOf(Object.keys(body.teams), 2);
          }
        })
      }
    }
  };
}
