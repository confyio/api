var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Environments', function () {

    describe('Listing non-existent project', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects/eng/envs', {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {'message':'Not found'});
      });
    });

    describe('Listing environment with no access', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects/main/envs', {user: 'vanstee', pass: 'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {'message':'Not found'});
      });
    });

    describe('Listing them with member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects/knowledge-base/envs', {user:'vanstee', pass:'password'}, ret));

      macro.status(200, ret);

      it('should return array of environments', function () {
        assert.lengthOf(ret.body, 1);
      });

      it('should return environments of the project', function () {
        assert.equal(ret.body[0]._id, 'orgs/confyio/projects/knowledge-base/envs/production');
      });

      it('should not return config', function () {
        assert.isUndefined(ret.body[0].config);
      });

      it('should not return versions', function () {
        assert.isUndefined(ret.body[0].versions);
      });
    });
  });
};
