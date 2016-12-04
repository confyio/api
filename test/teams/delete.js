var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Teams', function () {

    describe('Deleting non-existent team', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/teams/stuff', {}, {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });
    });

    describe('Deleting the default team', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/teams/owners', {}, {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['team', 'forbidden']], ret);
    });

    describe('Deleting team with owner', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/teams/consultants', {}, {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(204, ret);

      it('should not return the team', function () {
        assert.isUndefined(ret.body);
      });

      it('should delete team doc', macro.nodoc('orgs/confyio/teams/consultants', 'deleted'));

      describe('should update project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/knowledge-base', ret));

        it('should remove team from team list', function () {
          assert.isUndefined(ret.body.teams['consultants']);
        });

        it('should decrement the count for the users', function () {
          assert.isUndefined(ret.body.users['vanstee']);
          assert.equal(ret.body.users['pksunkara'], 1);
        });
      });

      describe('should update org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio', ret));

        it('should decrement the count for the users', function () {
          assert.isUndefined(ret.body.users['vanstee']);
          assert.equal(ret.body.users['pksunkara'], 3);
        });
      });
    });

    describe('Deleting team with member', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/teams/designers', {}, {user: 'shea', pass: 'password'}, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {message: 'Bad credentials'});
      });

      describe('should not delete team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/teams/designers', ret));

        it('should exist', function () {
          assert.isDefined(ret.body);
        });
      });
    });

    describe('Deleting team with no access', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/teams/designers', {}, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });

      describe('should not delete team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/teams/designers', ret));

        it('should exist', function () {
          assert.isDefined(ret.body);
        });
      });
    });

    describe('Deleting team with heroku user', function () {
      var ret = {};

      before(macro.delete('/orgs/app123/teams/owners', {}, {user: 'app123', pass: 'password'}, ret));

      macro.status(403, ret);

      it('should return forbidden', function () {
        assert.deepEqual(ret.body, {'message':'Forbidden action'});
      });
    });
  });
};
