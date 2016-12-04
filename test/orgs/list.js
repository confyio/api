var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Orgs', function () {
    
    describe('Listing them', function () {
      var ret = {};

      before(macro.get('/orgs', {user:'vanstee', pass:'password'}, ret));

      macro.status(200, ret);

      it('should return array of orgs', function () {
        assert.lengthOf(ret.body, 2);
      });

      it('should return orgs with user as owner', function () {
        assert.equal(ret.body[1]._id, 'orgs/vanstee');
        assert.equal(ret.body[1].owner, 'vanstee');
      });

      it('should return orgs with user as member', function () {
        assert.equal(ret.body[0]._id, 'orgs/confyio');
        assert.equal(ret.body[0].owner, 'pksunkara');
      });

      it('should not return users field for orgs', function () {
        assert.isUndefined(ret.body[0].users);
        assert.isUndefined(ret.body[1].users);
      });
    });
  });
};
