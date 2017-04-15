var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Teams', function () {

    describe('Accepting a team invite and registering', function () {
      var ret = {};

      before(macro.post('/user', {
        username: 'jksmith',
        fullname: 'John K Smith',
        password: 'secret',
        email: 'jksmith@gmail.com'
      }, null, ret));

      macro.status(201, ret);

      it('should delete the invite doc', macro.nodoc('invites/jksmith@gmail.com', 'deleted'));

      it('should return user', function () {
        assert.equal(ret.body._id, 'users/jksmith');
        assert.equal(ret.body.username, 'jksmith');
        assert.equal(ret.body.fullname, 'John K Smith');
        assert.equal(ret.body.email, 'jksmith@gmail.com');
        assert.equal(ret.body.type, 'user');
        assert.isFalse(ret.body.verified);
      });

      describe('should create user doc and it', function () {
        var ret = {};

        before(macro.doc('users/jksmith', ret));

        it('should have verification token', function () {
          assert.equal(ret.body.verification_token.length, 40);
          assert.isUndefined(ret.body.verify_new_email);
        });
      });

      describe('should update the invited team doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/teams/consultants', ret));

        it('should have new user in users list', function () {
          assert.isTrue(ret.body.users['jksmith']);
        });
      });

      describe('should update the invited org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio', ret));

        it('should increment the count for the user', function () {
          assert.equal(ret.body.users['jksmith'], 1);
        });
      });

      describe('should update the invited project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/knowledge-base', ret));

        it('should increment the count for the user', function () {
          assert.equal(ret.body.users['jksmith'], 1);
        });
      });
    });

    describe('Accepting a team invite of non-existent org and registering', function () {
      var ret = {};

      before(macro.post('/user', {
        username: 'jksmithorg',
        fullname: 'John K Smith',
        password: 'secret',
        email: 'jksmithorg@gmail.com'
      }, null, ret));

      macro.status(201, ret);

      it('should delete the invite doc', macro.nodoc('invites/jksmithorg@gmail.com', 'deleted'));

      it('should return user', function () {
        assert.equal(ret.body._id, 'users/jksmithorg');
        assert.equal(ret.body.username, 'jksmithorg');
        assert.equal(ret.body.fullname, 'John K Smith');
        assert.equal(ret.body.email, 'jksmithorg@gmail.com');
        assert.equal(ret.body.type, 'user');
        assert.isFalse(ret.body.verified);
      });

      describe('should create user doc and it', function () {
        var ret = {};

        before(macro.doc('users/jksmithorg', ret));

        it('should have verification token', function () {
          assert.equal(ret.body.verification_token.length, 40);
          assert.isUndefined(ret.body.verify_new_email);
        });
      });
    });

    describe('Accepting a team invite of non-existent team and registering', function () {
      var ret = {};

      before(macro.post('/user', {
        username: 'jksmithteam',
        fullname: 'John K Smith',
        password: 'secret',
        email: 'jksmithteam@gmail.com'
      }, null, ret));

      macro.status(201, ret);

      it('should delete the invite doc', macro.nodoc('invites/jksmithteam@gmail.com', 'deleted'));

      it('should return user', function () {
        assert.equal(ret.body._id, 'users/jksmithteam');
        assert.equal(ret.body.username, 'jksmithteam');
        assert.equal(ret.body.fullname, 'John K Smith');
        assert.equal(ret.body.email, 'jksmithteam@gmail.com');
        assert.equal(ret.body.type, 'user');
        assert.isFalse(ret.body.verified);
      });

      describe('should create user doc and it', function () {
        var ret = {};

        before(macro.doc('users/jksmithteam', ret));

        it('should have verification token', function () {
          assert.equal(ret.body.verification_token.length, 40);
          assert.isUndefined(ret.body.verify_new_email);
        });
      });

      describe('should not update the invited org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio', ret));

        it('should increment the count for the user', function () {
          assert.isUndefined(ret.body.users['jksmithteam']);
        });
      });
    });
  });
};
