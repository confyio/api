var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Teams', function () {

    describe('Listing users who are members of it by member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/teams/consultants/member', {user:'vanstee', pass:'password'}, ret));

      macro.status(200, ret);

      it('should return array of users', function () {
        assert.lengthOf(ret.body, 3);
      });

      it('should return users who are members of team', function () {
        assert.equal(ret.body[0]._id, 'users/pksunkara');
        assert.equal(ret.body[1]._id, 'users/whatupdave');
        assert.equal(ret.body[2]._id, 'users/vanstee');
      });

      it('should not retun password for the users', function () {
        ret.body.forEach(function (row) {
          assert.isUndefined(row.password);
        });
      });

      it('should not retun verification token for the users', function () {
        ret.body.forEach(function (row) {
          assert.isUndefined(row.verification_token);
          assert.isUndefined(row.verify_new_email);
        });
      });
    });

    describe('Listing users who are members of it by non-member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/teams/engineering/member', {user:'vanstee', pass:'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {'message':'Not found'});
      });
    });
  });
};
