var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Projects', function () {

    describe('Listing teams it has given access to by member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects/knowledge-base/access', {user:'vanstee', pass:'password'}, ret));

      macro.status(200, ret);

      it('should return array of teams', function () {
        assert.lengthOf(ret.body, 1);
      });

      it('should return access granted teams of which the user is a member', function () {
        assert.equal(ret.body[0]._id, 'orgs/confyio/teams/consultants');
      });

      it('should return users array for teams', function () {
        assert.deepEqual(ret.body[0].users, ['pksunkara','whatupdave','vanstee']);
      });
    });

    describe('Listing teams it has given access to by non-member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects/url-shortener/access', {user:'vanstee', pass:'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {'message':'Not found'});
      });
    });
  });
};
