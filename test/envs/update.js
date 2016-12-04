var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Environments', function () {

    describe('Updating environment with member', function () {
      var ret = {};

      before(macro.patch('/orgs/confyio/projects/main/envs/production', {
        description: 'Main production environment',
        random: '1i3je738ujf',
        org: 'hacked'
      }, {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(200, ret);

      it('should return the environment', function () {
        assert.equal(ret.body._id, 'orgs/confyio/projects/main/envs/production');
        assert.equal(ret.body.name, 'Production');
        assert.equal(ret.body.description, 'Main production environment');
        assert.equal(ret.body.project, 'main')
        assert.equal(ret.body.org, 'confyio');
        assert.equal(ret.body.type, 'env');
      });

      it('should not update random fields', function () {
        assert.isUndefined(ret.body.random);
      });

      it('should not return config', function () {
        assert.isUndefined(ret.body.config);
      });

      it('should not return versions', function () {
        assert.isUndefined(ret.body.versions);
      });

      describe('should update environment doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/main/envs/production', ret));

        it('should have updated description', function () {
          assert.equal(ret.body.description, 'Main production environment');
        });
      });
    });

    describe('Updating environment with no access', function () {
      var ret = {};

      before(macro.patch('/orgs/confyio/projects/main/envs/staging', {
        description: 'Seriously!',
      }, {user: 'vanstee', pass: 'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });

      describe('should not update environment doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/main/envs/staging', ret));

        it('should have old description', function () {
          assert.equal(ret.body.description, 'Staging environment');
        });
      });
    });
  });
};
