var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Projects', function () {

    describe('Adding team to project with missing params', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/projects/main-app/access', {}, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(422, ret);
      macro.validation(2, [], ret);
    });

    describe('Adding team to project with non-existent team', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/projects/main-app/access', {
        team: 'engineering'
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['team', 'does_not_exist']], ret);
    });

    describe('Adding team to project with too short team', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/projects/main-app/access', {
        team: 't'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['team', 'invalid']], ret);
    });

    describe('Adding team to project with too lengthy team', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/projects/main-app/access', {
        team: 'teams-management'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['team', 'invalid']], ret);
    });

    describe('Adding team to project with invalid team', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/projects/main-app/access', {
        team: '$@*'
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['team', 'invalid']], ret);
    });

    describe('Adding team to project', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects/main/access', {
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
        assert.deepEqual(ret.body.teams, ['owners', 'engineering', 'consultants']);
      });

      it('should not return users', function () {
        assert.isUndefined(ret.body.users);
      });

      describe('should update the project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/main', ret));

        it('should have new team in teams list', function () {
          assert.isTrue(ret.body.teams['consultants']);
        });

        it('should increment the count for the user', function () {
          assert.equal(ret.body.users['vanstee'], 1);
          assert.equal(ret.body.users['whatupdave'], 1);
          assert.equal(ret.body.users['pksunkara'], 3);
        });
      });
    });

    describe('Adding already team to project', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects/knowledge-base/access', {
        team: 'consultants', random: 'u2e83'
      }, {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(200, ret);

      it('should return the project doc', function () {
        assert.equal(ret.body._id, 'orgs/confyio/projects/knowledge-base');
        assert.equal(ret.body.name, 'Knowledge Base');
        assert.equal(ret.body.description, 'Wiki & FAQ support');
        assert.equal(ret.body.org, 'confyio');
        assert.equal(ret.body.type, 'project');
      });

      describe('should not update the project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/knowledge-base', ret));

        it('should not increment the count for the user', function () {
          assert.equal(ret.body.users['vanstee'], 1);
        });
      });
    });

    describe('Adding team to project with member', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects/knowledge-base/access', {
        team: 'engineering',
      }, {user: 'vanstee', pass: 'password'}, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {message: 'Bad credentials'});
      });

      describe('should not update team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/knowledge-base', ret));

        it('should have old teams', function () {
          assert.lengthOf(Object.keys(ret.body.teams), 2);
        });
      });
    });

    describe('Adding team to project with no access', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects/knowledge-base/access', {
        team: 'engineering',
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });

      describe('should not update team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/knowledge-base', ret));

        it('should have old teams', function () {
          assert.lengthOf(Object.keys(ret.body.teams), 2);
        });
      });
    });
  });
};
