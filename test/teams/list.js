var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Teams', function () {

    describe('Listing them with a member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/teams', {user:'vanstee', pass:'password'}, ret));

      macro.status(200, ret);

      it('should return array of teams', function () {
        assert.lengthOf(ret.body, 1);
      });

      it('should return teams with user as member', function () {
        assert.equal(ret.body[0]._id, 'orgs/confyio/teams/consultants');
      });

      it('should return users array for teams', function () {
        assert.deepEqual(ret.body[0].users, ['pksunkara','whatupdave','vanstee']);
      });
    });

    describe('Listing them with a non-member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/teams', {user:'mdeiters', pass:'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });
    });
  });
};
