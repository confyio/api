var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Environments', function () {

    describe('Retrieving non-existent environment', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects/main/envs/stuff', {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {'message':'Not found'});
      });
    });

    describe('Retrieving environment with no access', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects/main/envs/production', {user: 'vanstee', pass: 'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {'message':'Not found'});
      });
    });

    describe('Retrieving environment with member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects/knowledge-base/envs/production', {user: 'vanstee', pass: 'password'}, ret));

      macro.status(200, ret);

      it('should return the environment', function () {
        assert.equal(ret.body._id, 'orgs/confyio/projects/knowledge-base/envs/production');
        assert.equal(ret.body.name, 'Production');
        assert.equal(ret.body.description, 'Production environment');
        assert.equal(ret.body.project, 'knowledge-base');
        assert.equal(ret.body.org, 'confyio');
        assert.equal(ret.body.type, 'env');
      });

      it('should not return config', function () {
        assert.isUndefined(ret.body.config);
      });

      it('should not return versions', function () {
        assert.isUndefined(ret.body.versions);
      });
    });

    describe('Retrieving environment with owner', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects/knowledge-base/envs/production', {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(200, ret);

      it('should return the environment', function () {
        assert.equal(ret.body._id, 'orgs/confyio/projects/knowledge-base/envs/production');
        assert.equal(ret.body.name, 'Production');
        assert.equal(ret.body.description, 'Production environment');
        assert.equal(ret.body.project, 'knowledge-base');
        assert.equal(ret.body.org, 'confyio');
        assert.equal(ret.body.type, 'env');
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
