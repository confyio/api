var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Users', function () {

    describe('Retrieving authenticated user', function () {
      var ret = {};

      before(macro.get('/user', {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(200, ret);

      it('should return the user', function () {
        assert.equal(ret.body._id, 'users/jsmith');
        assert.equal(ret.body.username, 'jsmith');
        assert.equal(ret.body.fullname, 'John Kay Smith');
        assert.equal(ret.body.email, 'john.smith@gmail.com');
        assert.equal(ret.body.type, 'user');
        assert.isTrue(ret.body.verified);
      });

      it('should not retun password', function () {
        assert.isUndefined(ret.body.password);
      });

      it('should not retun verification token', function () {
        assert.isUndefined(ret.body.verification_token);
        assert.isUndefined(ret.body.verify_new_email);
      });
    });

    describe('Retrieving non-existent user', function () {
      var ret = {};

      before(macro.get('/user', {user: 'pavan', pass: 'secret'}, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {'message':'Bad credentials'});
      });
    });

    describe('Retrieving user with wrong password', function () {
      var ret = {};

      before(macro.get('/user', {user: 'jsmith', pass: 'secret1'}, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {'message':'Bad credentials'});
      });
    });
  });
};
