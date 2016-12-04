var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Orgs', function () {
    
    describe('Deleting non-existent org', function () {
      var ret = {};

      before(macro.delete('/orgs/assembly', {}, {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });
    });
    
    describe('Deleting the default org', function () {
      var ret = {};

      before(macro.delete('/orgs/pksunkara', {}, {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(422, ret);
      macro.validation(1, [['org', 'forbidden']], ret);
    });
    
    describe('Deleting org with owner', function () {
      var ret = {};

      before(macro.delete('/orgs/fire-size', {}, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(204, ret);

      it('should not return the org', function () {
        assert.isUndefined(ret.body);
      });

      it('should delete org doc', macro.nodoc('orgs/fire-size', 'deleted'));
      it('should delete project doc', macro.nodoc('orgs/fire-size/projects/main-app', 'deleted'));
      it('should delete team doc', macro.nodoc('orgs/fire-size/teams/dev-gods', 'deleted'));
      it('should delete environment doc', macro.nodoc('orgs/fire-size/projects/main-app/envs/production', 'deleted'));
    });
    
    describe('Deleting org with member', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio', {}, {user: 'shea', pass: 'password'}, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {message: 'Bad credentials'});
      });
      
      describe('should not delete org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio', ret));

        it('should exist', function () {
          assert.isDefined(ret.body);
        });
      });
    });
    
    describe('Deleting org with no access', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio', {}, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });
      
      describe('should not delete org doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio', ret));

        it('should exist', function () {
          assert.isDefined(ret.body);
        });
      });
    });
    
    describe('Deleting org with heroku user', function () {
      var ret = {};

      before(macro.delete('/orgs/app123', {}, {user: 'app123', pass: 'password'}, ret));

      macro.status(403, ret);

      it('should return forbidden', function () {
        assert.deepEqual(ret.body, {'message':'Forbidden action'});
      });
    });
  });
}
