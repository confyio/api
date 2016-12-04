var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Teams', function () {

    describe('Updating team with owner', function () {
      var ret = {};

      before(macro.patch('/orgs/fire-size/teams/dev-gods', {
        description: 'Main product developers',
        random: '1i3je738ujf',
        org: 'hacked'
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(200, ret);

      it('should return the team', function () {
        assert.equal(ret.body._id, 'orgs/fire-size/teams/dev-gods');
        assert.equal(ret.body.name, 'Dev Gods');
        assert.equal(ret.body.description, 'Main product developers');
        assert.equal(ret.body.org, 'fire-size');
        assert.equal(ret.body.type, 'team');
      });

      it('should not update random fields', function () {
        assert.isUndefined(ret.body.random);
      });

      it('should return users array', function () {
        assert.deepEqual(ret.body.users, ['jsmith']);
      });

      describe('should update team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size/teams/dev-gods', ret));

        it('should have updated description', function () {
          assert.equal(ret.body.description, 'Main product developers');
        });
      });
    });

    describe('Updating team with member', function () {
      var ret = {};

      before(macro.patch('/orgs/confyio/teams/consultants', {
        description: 'Only consultants man!',
      }, {user: 'vanstee', pass: 'password'}, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {message: 'Bad credentials'});
      });

      describe('should not update team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/teams/consultants', ret));

        it('should have old description', function () {
          assert.equal(ret.body.description, 'Consultants will have restricted access to the projects');
        });
      });
    });

    describe('Updating team with no access', function () {
      var ret = {};

      before(macro.patch('/orgs/confyio/teams/consultants', {
        description: 'Only consultants man!',
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });

      describe('should not update team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/teams/consultants', ret));

        it('should have old description', function () {
          assert.equal(ret.body.description, 'Consultants will have restricted access to the projects');
        });
      });
    });
  });
};
