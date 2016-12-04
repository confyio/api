var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Orgs', function () {
    
    describe('Retrieving non-existent org', function () {
      var ret = {};

      before(macro.get('/orgs/helpful', {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {'message':'Not found'});
      });
    });
    
    describe('Retrieving org with no access', function () {
      var ret = {};

      before(macro.get('/orgs/confyio', {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {'message':'Not found'});
      });
    });
    
    describe('Retrieving org with owner', function () {
      var ret = {};

      before(macro.get('/orgs/jsmith', {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(200, ret);

      it('should return the org', function () {
        assert.equal(ret.body._id, 'orgs/jsmith');
        assert.equal(ret.body.name, 'John Smith');
        assert.equal(ret.body.email, 'johnsmith@gmail.com');
        assert.equal(ret.body.owner, 'jsmith');
        assert.equal(ret.body.type, 'org');
        assert.equal(ret.body.plan, 'none');
      });

      it('should not return users list', function () {
        assert.isUndefined(ret.body.users);
      });
    });
    
    describe('Retrieving org with member', function () {
      var ret = {};

      before(macro.get('/orgs/confyio', {user: 'vanstee', pass: 'password'}, ret));

      macro.status(200, ret);

      it('should return the org', function () {
        assert.equal(ret.body._id, 'orgs/confyio');
        assert.equal(ret.body.name, 'Confyio');
        assert.equal(ret.body.email, 'admin@confy.io');
        assert.equal(ret.body.owner, 'pksunkara');
        assert.equal(ret.body.type, 'org');
        assert.equal(ret.body.plan, 'none');
      });

      it('should not return users list', function () {
        assert.isUndefined(ret.body.users);
      });
    });
  });
};
