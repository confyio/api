var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Users', function () {

    describe('Creating them with missing params', function () {
      var ret = {};

      before(macro.post('/user', {}, null, ret));

      macro.status(422, ret);
      macro.validation(6, [], ret);
    });

    describe('Creating them with existing email', function () {
      var ret = {};

      before(macro.post('/user', {
        username: 'jsmith', password: 'secret',
        email: 'pavan.sss1991@gmail.com'
      }, null, ret));

      macro.status(422, ret);
      macro.validation(1, [['email', 'already_exists']], ret);
    });

    describe('Creating them with existing username', function () {
      var ret = {};

      before(macro.post('/user', {
        username: 'pksunkara', password: 'secret',
        email: 'pk@sunkara.com'
      }, null, ret));

      macro.status(422, ret);
      macro.validation(1, [['username', 'already_exists']], ret);
    });

    describe('Creating them with too short username', function () {
      var ret = {};

      before(macro.post('/user', {
        username: 'u', password: 'tooshort',
        email: 'tooshort@confytest.com'
      }, null, ret));

      macro.status(422, ret);
      macro.validation(1, [['username', 'invalid']], ret);
    });

    describe('Creating them with too lengthy username', function () {
      var ret = {};

      before(macro.post('/user', {
        username: 'iamtoolengthyusername', password: 'toolengthy',
        email: 'toolengthy@confytest.com'
      }, null, ret));

      macro.status(422, ret);
      macro.validation(1, [['username', 'invalid']], ret);
    });

    describe('Creating them with invalid username', function () {
      var ret = {};

      before(macro.post('/user', {
        username: '@$*', password: 'secret',
        email: 'pk@sunkara.com'
      }, null, ret));

      macro.status(422, ret);
      macro.validation(1, [['username', 'invalid']], ret);
    });

    describe('Creating them with invalid email', function () {
      var ret = {};

      before(macro.post('/user', {
        username: 'jsmith', password: 'invalidemail',
        email: 'invalid@email'
      }, null, ret));

      macro.status(422, ret);
      macro.validation(1, [['email', 'invalid']], ret);
    });

    describe('Creating them', function () {
      var ret = {};

      before(macro.post('/user', {
        username: 'jsmith',
        fullname: 'John Smith',
        password: 'secret',
        email: 'johnsmith@gmail.com',
        random: '123xyz'
      }, null, ret));

      macro.status(201, ret);

      it('should return user', function () {
        assert.equal(ret.body._id, 'users/jsmith');
        assert.equal(ret.body.username, 'jsmith');
        assert.equal(ret.body.fullname, 'John Smith');
        assert.equal(ret.body.email, 'johnsmith@gmail.com');
        assert.equal(ret.body.type, 'user');
        assert.isFalse(ret.body.verified);
      });

      it('should not return password', function () {
        assert.isUndefined(ret.body.password);
      });

      it('should not save other keys', function () {
        assert.isUndefined(ret.body.random);
      });

      it('should not retun verification token', function () {
        assert.isUndefined(ret.body.verification_token);
        assert.isUndefined(ret.body.verify_new_email);
      });

      describe('should create user doc and it', function () {
        var ret = {};

        before(macro.doc('users/jsmith', ret));

        it('should have verification token', function () {
          assert.equal(ret.body.verification_token.length, 40);
          assert.isUndefined(ret.body.verify_new_email);
        });
      });

      describe('should create default org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/jsmith', ret));

        it('should be default for user', function () {
          assert.equal(ret.body.name, 'John Smith');
          assert.equal(ret.body.type, 'org');
        });

        it('should have user as owner', function () {
          assert.equal(ret.body.owner, 'jsmith');
        });

        it('should have user email as billing email', function () {
          assert.equal(ret.body.email, 'johnsmith@gmail.com');
        });

        it('should have user in list of users', function () {
          assert.deepEqual(ret.body.users, {jsmith: 1});
        });
      });

      describe('should create default team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/jsmith/teams/owners', ret));

        it('should be default for org', function () {
          assert.equal(ret.body.name, 'Owners');
          assert.equal(ret.body.type, 'team');
          assert.equal(ret.body.description, 'Has access to all projects');
        });

        it('should have user in list of users', function () {
          assert.deepEqual(ret.body.users, {jsmith: true});
        });
      });
    });

    describe('Creating them with empty fullname', function () {
      var ret = {};

      before(macro.post('/user', {
        username: 'pkumar',
        password: 'secret',
        email: 'pkumar@cse.iitm.ac.in'
      }, null, ret));

      macro.status(201, ret);

      it('should return user', function () {
        assert.equal(ret.body._id, 'users/pkumar');
        assert.equal(ret.body.username, 'pkumar');
        assert.equal(ret.body.fullname, 'pkumar');
        assert.equal(ret.body.email, 'pkumar@cse.iitm.ac.in');
        assert.equal(ret.body.type, 'user');
        assert.isFalse(ret.body.verified);
      });

      describe('should create default org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/pkumar', ret));

        it('should be default for user', function () {
          assert.equal(ret.body.name, 'pkumar');
          assert.equal(ret.body.type, 'org');
        });
      });
    });
  });
};
