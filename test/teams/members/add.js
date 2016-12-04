var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Teams', function () {

    describe('Adding member to team with missing params', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/teams/dev-gods/member', {}, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(422, ret);
      macro.validation(2, [], ret);
    });

    describe('Adding member to team with non-existent user', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/teams/dev-gods/member', {
        user: 'sunkara'
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['user', 'does_not_exist']], ret);
    });

    describe('Adding member to team with too short user', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/teams/dev-gods/member', {
        user: 'u'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['user', 'invalid']], ret);
    });

    describe('Adding member to team with too lengthy user', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/teams/dev-gods/member', {
        user: 'iamtoolengthyusername'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['user', 'invalid']], ret);
    });

    describe('Adding member to team with invalid user', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/teams/dev-gods/member', {
        user: '$@&'
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['user', 'invalid']], ret);
    });

    describe('Adding member to team', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/teams/engineering/member', {
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
        assert.deepEqual(ret.body.users, ['pksunkara', 'mdeiters']);
      });

      describe('should update the team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/teams/engineering', ret));

        it('should have new user in users list', function () {
          assert.isTrue(ret.body.users['mdeiters']);
        });
      });

      describe('should update the org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio', ret));

        it('should increment the count for the user', function () {
          assert.equal(ret.body.users['mdeiters'], 1);
        });
      });

      describe('should update the project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/main', ret));

        it('should increment the count for the user', function () {
          assert.equal(ret.body.users['mdeiters'], 1);
        });
      });
    });

    describe('Adding already member to team', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/teams/dev-gods/member', {
        user: 'jsmith', random: 'u2e83'
      }, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(200, ret);

      it('should return the team doc', function () {
        assert.equal(ret.body._id, 'orgs/fire-size/teams/dev-gods');
        assert.equal(ret.body.name, 'Dev Gods');
        assert.equal(ret.body.description, 'Main product developers');
        assert.equal(ret.body.org, 'fire-size');
        assert.equal(ret.body.type, 'team');
      });

      describe('should not update the org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size', ret));

        it('should not increment the count for the user', function () {
          assert.equal(ret.body.users['jsmith'], 2);
        });
      });
    });

    describe('Adding member to team with member', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/teams/consultants/member', {
        user: 'mdeiters',
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

    describe('Adding member to team with no access', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/teams/consultants/member', {
        user: 'mdeiters',
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
