var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Environments', function () {

    describe('Deleting non-existent envrionment', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/projects/main/envs/stuff', {}, {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });
    });

    describe('Deleting environment with owner', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/projects/main/envs/production', {}, {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(204, ret);

      it('should not return the environment', function () {
        assert.isUndefined(ret.body);
      });

      it('should delete envrionment doc', macro.nodoc('orgs/confyio/projects/main/envs/production', 'deleted'));
    });

    describe('Deleting envrionment with member', function () {
      var ret = {};

      before(macro.delete('/orgs/fire-size/projects/main-app/envs/staging-beta', {}, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(204, ret);

      it('should not return the envrionment', function () {
        assert.isUndefined(ret.body);
      });

      it('should delete envrionment doc', macro.nodoc('orgs/fire-size/projects/main-app/envs/staging-beta', 'deleted'));
    });

    describe('Deleting envrionment with no access', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/projects/knowledge-base/envs/production', {}, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });

      describe('should not delete envrionment doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/knowledge-base/envs/production', ret));

        it('should exist', function () {
            assert.isDefined(body);
        });
      });
    });
  });
};
