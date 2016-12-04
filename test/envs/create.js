var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Environments', function () {

    describe('Creating them using non-member', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects/main/envs', {}, {user:'jsmith', pass:'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });
    });

    describe('Creating them with missing params by member', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects/knowledge-base/envs', {}, {user:'vanstee', pass:'password'}, ret));

      macro.status(422, ret);
      macro.validation(3, [], ret);
    });

    describe('Creating them with existing name', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects/main/envs', {
        name: 'Production', description: 'Production'
      }, {user:'pksunkara', pass:'password'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['name', 'already_exists']], ret);
    });

    describe('Creating them with too short name', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects/main/envs', {
        name: 'E', description: 'Short Name'
      }, {user:'pksunkara', pass:'password'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['name', 'invalid']], ret);
    });

    describe('Creating them with too lengthy name', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects/main/envs', {
        name: 'Environment Management', description: 'Lengthy Name'
      }, {user:'pksunkara', pass:'password'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['name', 'invalid']], ret);
    });

    describe('Creating them with invalid name', function () {
      var ret = {};

      before(macro.post('/orgs/confyio/projects/main/envs', {
        name: '$@*', description: 'Production'
      }, {user:'pksunkara', pass:'password'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['name', 'invalid']], ret);
    });

    describe('Creating them', function () {
      var ret = {};

      before(macro.post('/orgs/fire-size/projects/main-app/envs', {
        name: 'Staging Beta', description: 'Staging',
        random: '1e3', org: 'fire-size'
      }, {user:'jsmith', pass:'secret'}, ret));

      macro.status(201, ret);

      it('should return environment', function () {
        assert.equal(ret.body._id, 'orgs/fire-size/projects/main-app/envs/staging-beta');
        assert.equal(ret.body.name, 'Staging Beta');
        assert.equal(ret.body.description, 'Staging');
        assert.equal(ret.body.project, 'main-app');
        assert.equal(ret.body.org, 'fire-size');
        assert.equal(ret.body.type, 'env');
        assert.isDefined(ret.body.token);
      });

      it('should not save other keys', function () {
        assert.isUndefined(ret.body.random);
      });

      it('should not return config', function () {
        assert.isUndefined(ret.body.config);
      });

      it('should not return versions', function () {
        assert.isUndefined(ret.body.versions);
      });

      describe('should create environment doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/fire-size/projects/main-app/envs/staging-beta', ret));

        it('should exist', function () {
          assert.isDefined(ret.body);
        });
      });
    });
  });
};
