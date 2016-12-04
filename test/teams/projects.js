var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Teams', function () {

    describe('Listing projects it has access to by member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/teams/consultants/projects', {user:'vanstee', pass:'password'}, ret));

      macro.status(200, ret);

      it('should return array of projects', function () {
        assert.lengthOf(ret.body, 1);
      });

      it('should return projects with access by team', function () {
        assert.equal(ret.body[0]._id, 'orgs/confyio/projects/knowledge-base');
      });

      it('should return teams array for projects', function () {
        assert.deepEqual(ret.body[0].teams, ['owners','consultants']);
      });

      it('should not return users', function () {
        assert.isUndefined(ret.body[0].users);
      });
    });

    describe('Listing projects it has access to by non-member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/teams/engineering/projects', {user:'vanstee', pass:'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {'message':'Not found'});
      });
    });
  });
};
