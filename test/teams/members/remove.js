var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Teams', function () {

    describe('Removing member from team with missing params', function () {
      var ret = {};

      before(macro.delete('/orgs/fire-size/teams/dev-gods/member', {}, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(422, ret);
      macro.validation(2, [], ret);
    });

    describe('Removing member from team', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/teams/engineering/member', {
        user: 'mdeiters', random: 'u2e83'
      }, {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(200, ret);

      it('should return the team doc', function () {
        assert.equal(ret.body._id, 'orgs/confyio/teams/engineering');
        assert.equal(ret.body.name, 'Engineering');
        assert.equal(ret.body.description, 'Engineers in the company');
        assert.equal(ret.body.org, 'confyio');
        assert.equal(ret.body.type, 'team');
      });

      it('should not return random fields', function () {
        assert.isUndefined(ret.body.random);
      });

      it('should return users array', function () {
        assert.deepEqual(ret.body.users, ['pksunkara']);
      });

      describe('should update the team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/teams/engineering', ret));

        it('should not have user in users list', function () {
          assert.isUndefined(ret.body.users['mdeiters']);
        });
      });

      describe('should update the org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio', ret));

        it('should decrement the count for the user', function () {
          assert.isUndefined(ret.body.users['mdeiters']);
        });
      });

      describe('should update the project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/main', ret));

        it('should decrement the count for the user', function () {
          assert.isUndefined(ret.body.users['mdeiters']);
        });
      });
    });

    describe('Removing owner member from team', function () {
      var ret = {};

      before(macro.delete('/orgs/fire-size/teams/dev-gods/member', {
        user: 'jsmith'
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['user', 'forbidden']], ret);

      describe('should not update the team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size/teams/dev-gods', ret));

        it('should have owner in users list', function () {
          assert.isTrue(ret.body.users['jsmith']);
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

    describe('Removing non-member from team', function () {
      var ret = {};

      before(macro.delete('/orgs/fire-size/teams/dev-gods/member', {
        user: 'vanstee'
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(200, ret);

      it('should return the team doc', function () {
        assert.equal(ret.body._id, 'orgs/fire-size/teams/dev-gods');
        assert.equal(ret.body.name, 'Dev Gods');
        assert.equal(ret.body.description, 'Main product developers');
        assert.equal(ret.body.org, 'fire-size');
        assert.equal(ret.body.type, 'team');
      });

      describe('should not update the team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size/teams/dev-gods', ret));

        it('should not have user in users list', function () {
          assert.isUndefined(ret.body.users['vanstee']);
        });
      });

      describe('should not update the org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size', ret));

        it('should not change the count for the user', function () {
          assert.isUndefined(ret.body.users['vanstee']);
        });
      });
    });

    describe('Removing member from team with member', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/teams/consultants/member', {
        user: 'whatupdave',
      }, {user: 'vanstee', pass: 'password'}, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {message: 'Bad credentials'});
      });

      describe('should not update team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/teams/consultants', ret));

        it('should have old users', function () {
          assert.lengthOf(Object.keys(ret.body.users), 3);
        });
      });
    });

    describe('Removing member from team with no access', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/teams/consultants/member', {
        user: 'whatupdave',
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });

      describe('should not update team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/teams/consultants', ret));

        it('should have old users', function () {
          assert.lengthOf(Object.keys(ret.body.users), 3);
        });
      });
    });
  });
};
