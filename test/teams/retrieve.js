var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Teams', function () {

    describe('Retrieving non-existent team', function () {
      var ret = {};

      before(macro.get('/orgs/jsmith/teams/eng', {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {'message':'Not found'});
      });
    });

    describe('Retrieving team with no access', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/teams/owners', {user: 'vanstee', pass: 'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {'message':'Not found'});
      });
    });

    describe('Retrieving team with member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/teams/consultants', {user: 'vanstee', pass: 'password'}, ret));

      macro.status(200, ret);

      it('should return the team', function () {
        assert.equal(ret.body._id, 'orgs/confyio/teams/consultants');
        assert.equal(ret.body.name, 'Consultants');
        assert.equal(ret.body.description, 'Consultants will have restricted access to the projects');
        assert.equal(ret.body.org, 'confyio');
        assert.equal(ret.body.type, 'team');
      });

      it('should return users array', function () {
        assert.deepEqual(ret.body.users, ['pksunkara','whatupdave','vanstee']);
      });
    });

    describe('Retrieving team with owner', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/teams/consultants', {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(200, ret);

      it('should return the team', function () {
        assert.equal(ret.body._id, 'orgs/confyio/teams/consultants');
        assert.equal(ret.body.name, 'Consultants');
        assert.equal(ret.body.description, 'Consultants will have restricted access to the projects');
        assert.equal(ret.body.org, 'confyio');
        assert.equal(ret.body.type, 'team');
      });

      it('should return users array', function () {
        assert.deepEqual(ret.body.users, ['pksunkara','whatupdave','vanstee']);
      });
    });
  });
};
