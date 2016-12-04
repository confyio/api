var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Projects', function () {

    describe('Removing team from project with missing params', function () {
      var ret = {};

      before(macro.delete('/orgs/fire-size/projects/main-app/access', {}, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(422, ret);
      macro.validation(2, [], ret);
    });

    describe('Removing team from project', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/projects/main/access', {
        team: 'consultants', random: 'u2e83'
      }, {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(200, ret);

      it('should return the project doc', function () {
        assert.equal(ret.body._id, 'orgs/confyio/projects/main');
        assert.equal(ret.body.name, 'Main');
        assert.equal(ret.body.description, 'Main app');
        assert.equal(ret.body.org, 'confyio');
        assert.equal(ret.body.type, 'project');
      });

      it('should not return random fields', function () {
        assert.isUndefined(ret.body.random);
      });

      it('should return teams array', function () {
        assert.deepEqual(ret.body.teams, ['owners', 'engineering']);
      });

      it('should not reutn users', function () {
        assert.isUndefined(ret.body.users);
      });

      describe('should update the project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/main', ret));

        it('should not have team in teams list', function () {
          assert.isUndefined(ret.body.teams['consultants']);
        });

        it('should decrement the count for the user', function () {
          assert.isUndefined(ret.body.users['vanstee']);
          assert.isUndefined(ret.body.users['whatupdave']);
          assert.equal(ret.body.users['pksunkara'], 2);
        });
      });
    });

    describe('Removing default team from project', function () {
      var ret = {};

      before(macro.delete('/orgs/fire-size/projects/main-app/access', {
        team: 'owners'
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(422, ret);

      macro.validation(1, [['team', 'forbidden']], ret);

      describe('should not update the project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size/projects/main-app', ret));

        it('should have default team in teams list', function () {
          assert.isTrue(ret.body.teams['owners']);
        });
      });

      describe('should not update the org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size', ret));

        it('should not change the count for the user', function () {
          assert.equal(ret.body.users['jsmith'], 2);
        });
      });
    });

    describe('Removing non-access team from project', function () {
      var ret = {};

      before(macro.delete('/orgs/fire-size/projects/main-app/access', {
        team: 'dev'
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(200, ret);

      it('should return the project doc', function () {
        assert.equal(ret.body._id, 'orgs/fire-size/projects/main-app');
        assert.equal(ret.body.name, 'Main App');
        assert.equal(ret.body.description, 'Main api backend');
        assert.equal(ret.body.org, 'fire-size');
        assert.equal(ret.body.type, 'project');
      });

      it('should return teams array', function () {
        assert.deepEqual(ret.body.teams, ['owners']);
      });

      it('should not reutn users', function () {
        assert.isUndefined(ret.body.users);
      });

      describe('should not update the project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size/projects/main-app', ret));

        it('should not have team in teams list', function () {
          assert.isUndefined(ret.body.teams['dev']);
        });
      });
    });

    describe('Removing team from project with member', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/projects/knowledge-base/access', {
        team: 'consultants',
      }, {user: 'vanstee', pass: 'password'}, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {message: 'Bad credentials'});
      });

      describe('should not update project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/knowledge-base', ret));

        it('should have old teams', function () {
          assert.lengthOf(Object.keys(ret.body.teams), 2);
        });
      });
    });

    describe('Removing team from project with no access', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/projects/knowledge-base/access', {
        team: 'consultants',
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });

      describe('should not update project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/knowledge-base', ret));

        it('should have old teams', function () {
          assert.lengthOf(Object.keys(ret.body.teams), 2);
        });
      });
    });
  });
};
