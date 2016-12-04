var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Projects', function () {

    describe('Retrieving non-existent project', function () {
      var ret = {};

      before(macro.get('/orgs/jsmith/projects/eng', {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {'message':'Not found'});
      });
    });

    describe('Retrieving project with no access', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects/main', {user: 'vanstee', pass: 'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {'message':'Not found'});
      });
    });

    describe('Retrieving project with member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects/knowledge-base', {user: 'vanstee', pass: 'password'}, ret));

      macro.status(200, ret);

      it('should return the project', function () {
        assert.equal(ret.body._id, 'orgs/confyio/projects/knowledge-base');
        assert.equal(ret.body.name, 'Knowledge Base');
        assert.equal(ret.body.description, 'Wiki & FAQ support');
        assert.equal(ret.body.org, 'confyio');
        assert.equal(ret.body.type, 'project');
      });

      it('should return teams array', function () {
        assert.deepEqual(ret.body.teams, ['owners', 'consultants']);
      });

      it('should not return users', function () {
        assert.isUndefined(ret.body.users);
      });
    });

    describe('Retrieving project with owner', function () {
      var ret = {};

      before(macro.get('/orgs/confyio/projects/knowledge-base', {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(200, ret);

      it('should return the project', function () {
        assert.equal(ret.body._id, 'orgs/confyio/projects/knowledge-base');
        assert.equal(ret.body.name, 'Knowledge Base');
        assert.equal(ret.body.description, 'Wiki & FAQ support');
        assert.equal(ret.body.org, 'confyio');
        assert.equal(ret.body.type, 'project');
      });

      it('should return teams array', function () {
        assert.deepEqual(ret.body.teams, ['owners', 'consultants']);
      });

      it('should not return users', function () {
        assert.isUndefined(ret.body.users);
      });
    });
  });
};
