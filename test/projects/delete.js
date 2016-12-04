var assert = require('chai').assert;

module.exports = function (macro) {
  describe('Projects', function () {

    describe('Deleting non-existent project', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/projects/stuff', {}, {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });
    });

    describe('Deleting project with owner', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/projects/url-shortener', {}, {user: 'pksunkara', pass: 'password'}, ret));

      macro.status(204, ret);

      it('should not return the project', function () {
        assert.isUndefined(ret.body);
      });

      it('should delete project doc', macro.nodoc('orgs/confyio/projects/url-shortener', 'deleted'));

      it('should delete project environment doc', macro.nodoc('orgs/confyio/projects/url-shortener/envs/production', 'deleted'));
    });

    describe('Deleting project with member', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/projects/knowledge-base', {}, {user: 'vanstee', pass: 'password'}, ret));

      macro.status(401, ret);

      it('should return bad credentials', function () {
        assert.deepEqual(ret.body, {message: 'Bad credentials'});
      });

      describe('should not delete project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/knowledge-base', ret));

        it('should exist', function () {
          assert.isDefined(ret.body);
        });
      });

      describe('should not delete project environment doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/knowledge-base/envs/production', ret));

        it('should exist', function () {
          assert.isDefined(ret.body);
        });
      });
    });

    describe('Deleting project with no access', function () {
      var ret = {};

      before(macro.delete('/orgs/confyio/projects/knowledge-base', {}, {user: 'jsmith', pass: 'secret'}, ret));

      macro.status(404, ret);

      it('should return not found', function () {
        assert.deepEqual(ret.body, {message: 'Not found'});
      });

      describe('should not delete project doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/knowledge-base', ret));

        it('should exist', function () {
          assert.isDefined(ret.body);
        });
      });

      describe('should not delete project environment doc and it', function () {
        var ret = {};

        before(macro.doc('orgs/confyio/projects/knowledge-base/envs/production', ret));

        it('should exist', function () {
          assert.isDefined(ret.body);
        });
      });
    });

    describe('Deleting project with heroku user', function () {
      var ret = {};

      before(macro.delete('/orgs/app123/projects/app', {}, {user: 'app123', pass: 'password'}, ret));

      macro.status(403, ret);

      it('should return forbidden', function () {
        assert.deepEqual(ret.body, {'message':'Forbidden action'});
      });
    });
  });
};
