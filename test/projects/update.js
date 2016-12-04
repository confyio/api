var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Projects', function () {

    describe('Updating project with owner', function () {
      var ret = {};

      before(macro.patch('/orgs/fire-size/projects/main-app', {
        description: 'Main api backend',
        random: '1i3je738ujf',
        org: 'hacked'
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(200, ret);

      it('should return the project', function () {
        assert.equal(ret.body._id, 'orgs/fire-size/projects/main-app');
        assert.equal(ret.body.name, 'Main App');
        assert.equal(ret.body.description, 'Main api backend');
        assert.equal(ret.body.org, 'fire-size');
        assert.equal(ret.body.type, 'project');
      });

      it('should not update random fields', function () {
        assert.isUndefined(ret.body.random);
      });

      it('should return teams array', function () {
        assert.deepEqual(ret.body.teams, ['owners']);
      });

      it('should not return users array', function () {
        assert.isUndefined(ret.body.users);
      });

      describe('should update project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size/projects/main-app', ret));

        it('should have updated description', function () {
          assert.equal(ret.body.description, 'Main api backend');
        });
      });
    });

    describe('Updating project with member', function () {
      var ret = {};

      before(macro.patch('/orgs/confyio/projects/knowledge-base', {
        description: 'Seriously!',
      }, {user: 'vanstee', pass: 'password'}, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {message: 'Bad credentials'});
      });

      describe('should not update project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/knowledge-base', ret));

        it('should have old description', function () {
          assert.equal(ret.body.description, 'Wiki & FAQ support');
        });
      });
    });

    describe('Updating project with no access', function () {
      var ret = {};

      before(macro.patch('/orgs/confyio/projects/knowledge-base', {
        description: 'Seriously!',
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });

      describe('should not update project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/knowledge-base', ret));

        it('should have old description', function () {
          assert.equal(ret.body.description, 'Wiki & FAQ support');
        });
      });
    });
  });
};
