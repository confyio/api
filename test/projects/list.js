var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Projects', function () {

    describe('Listing them with a member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects', {user:'vanstee', pass:'password'}, ret));

      macro.status(200, ret);

      it('should return array of projects', function () {
        assert.lengthOf(ret.body, 1);
      });

      it('should return projects with user as member', function () {
        assert.equal(ret.body[0]._id, 'orgs/confyio/projects/knowledge-base');
      });

      it('should return teams array for projects', function () {
        assert.deepEqual(ret.body[0].teams, ['owners', 'consultants']);
      });

      it('should not return users', function () {
        assert.isUndefined(ret.body[0].users);
      });
    });

    describe('Listing them with a non-member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects', {user:'mdeiters', pass:'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });
    });

    describe('Listing them with a member but empty projects', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects', {user:'shea', pass:'password'}, ret));

      macro.status(200, ret);

      it('should return empty array of projects', function () {
        assert.lengthOf(ret.body, 0);
      });
    });
  });
};
