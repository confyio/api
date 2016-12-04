var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Environments', function () {

    describe('Resetting token using non-member', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects/main/envs/production/token', {}, {user:'jsmith', pass:'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });
    });

    describe('Resetting token', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects/main/envs/production/token', {}, {user:'pksunkara', pass:'password'}, ret));

      macro.status(201, ret);

      it('should return environment', function () {
        assert.equal(ret.body._id, 'orgs/confyio/projects/main/envs/production');
        assert.equal(ret.body.name, 'Production');
        assert.equal(ret.body.description, 'Main production environment');
        assert.equal(ret.body.project, 'main');
        assert.equal(ret.body.org, 'confyio');
        assert.equal(ret.body.type, 'env');
        assert.isDefined(ret.body.token);
        assert.notEqual(ret.body.token, 'b3587b32be5a0cd7043680090b1af780e473cb5b');
      });

      it('should not return config', function () {
        assert.isUndefined(ret.body.config);
      });

      it('should not return versions', function () {
        assert.isUndefined(ret.body.versions);
      });
    });
  });
};
